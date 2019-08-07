import debug from 'debug';
import {Dropbox as DropboxSdk} from 'dropbox';
import popupCentered from 'popup-centered';
import {DocData} from '../document/doc';
import environment from '../environment/environment';
import StorageProvider from './storage-provider';
import StorageType from './storage-type';

/** A file selected in Dropbox chooser. */
interface DropboxChooserResult {
  /** Unique ID for the file, compatible with Dropbox API v2. */
  id: string;
  /** Name of the file. */
  name: string;
  /** URL to access the file, which varies depending on the linkType specified when the
   * Chooser was triggered. */
  link?: string;
  /** Size of the file in bytes. */
  bytes: number;
  /** URL to a 64x64px icon for the file based on the file's extension. */
  icon: string;
  /** A thumbnail URL generated when the user selects images and videos.
   * If the user didn't select an image or video, no thumbnail will be included. */
  thumbnailLink?: string;
  /** Boolean, whether or not the file is actually a directory */
  isDir: boolean;
}

const SCRIPT_ELEMENT_ID = 'dropboxjs';
const POPUP_ID = 'dropbox-oauth';
const OAUTH_TOKEN_STORAGE_KEY = 'dropbox-access-token';

let DropboxDropIns: any;

class DropboxStorageProvider extends StorageProvider {
  constructor() {
    super();
    if (this.isEnabled) {
      this.log('Enabled');
      this.init();
    } else {
      this.log('Disabled');
    }
  }

  get storageType() {
    return StorageType.DROPBOX;
  }

  get displayName() {
    return 'Dropbox';
  }

  get isEnabled() {
    return !!environment.dropboxApiKey;
  }

  get isAuthenticated() {
    return !!this.accessToken;
  }

  async auth(): Promise<boolean> {
    this.log('Starting OAuth flow');
    let oauthUrl = this.dbx.getAuthenticationUrl(
      environment.getAbsoluteUrl('dropbox-auth-success'),
      '',
      'token'
    );
    let oauthWindow = popupCentered(oauthUrl, POPUP_ID, {
      width: 900,
      height: 900,
    });
    if (!oauthWindow) {
      this.log('Unable to open OAuth window!');
      return false;
    }
    return new Promise((resolve) => {
      this.checkOauthWindowClosed(oauthWindow, resolve);
    });
  }

  async open(): Promise<DocData | null> {
    return new Promise((resolve) => {
      this.log('Opening Dropbox chooser');
      DropboxDropIns.choose({
        async success(files: Array<DropboxChooserResult>) {
          if (!files || !files.length) {
            this.log('No result from Dropbox chooser');
            resolve(null);
            return;
          }
          let file = files[0];
          this.log(`Got result from Dropbox chooser`, file);
          resolve(null);
        },
        cancel() {
          this.log('Dropbox chooser canceled');
          resolve(null);
        },
        linkType: 'direct',
        log: this.log,
      });
    });
  }

  async processOauthRedirectUrl(location: Location) {
    let {hash} = location;
    if (!hash || !hash.startsWith('#')) {
      this.log('No URL hash');
      return false;
    }
    let params = new URLSearchParams(hash.substring(1));
    let accessToken = params.get('access_token');
    if (!accessToken) {
      this.log('No valid access_token parameter in URL hash');
      return false;
    }
    this.log(`Storing access_token extracted from URL hash: ${accessToken}`);
    this.accessToken = accessToken;
    await this.initSdk();
    return this.isAuthenticated;
  }

  private init() {
    // Initialize drop-ins library.
    let existingScriptEl = document.getElementById(SCRIPT_ELEMENT_ID);
    if (!existingScriptEl) {
      let scriptEl = document.createElement('script');
      scriptEl.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      scriptEl.id = SCRIPT_ELEMENT_ID;
      scriptEl.dataset['appKey'] = environment.dropboxApiKey!;
      document.body.appendChild(scriptEl);
    }
    this.checkDropIns();
    // Initialize SDK.
    this.initSdk();
  }

  private checkDropIns() {
    if (
      window['Dropbox'] &&
      window['Dropbox']['choose'] &&
      window['Dropbox']['save']
    ) {
      this.isReady = true;
      this.log('Drop-ins ready');
      DropboxDropIns = window['Dropbox'];
    } else {
      setTimeout(this.checkDropIns.bind(this), 100);
    }
  }

  private async initSdk() {
    let {accessToken} = this;
    if (accessToken) {
      this.log('Constructing authenticated Dropbox SDK client');
      this.dbx = new DropboxSdk({
        clientId: environment.dropboxApiKey,
        accessToken,
        fetch,
      });
      this.log(`Validating access token ${accessToken}`);
      try {
        await this.dbx.filesListFolder({
          path: '',
          limit: 1,
        });
        this.log(`Access token is valid: ${accessToken}`);
        return;
      } catch (e) {
        this.log(`Access token is invalid, clearing: ${accessToken}`);
        this.accessToken = null;
      }
    }

    this.log('Constructing unauthenticated Dropbox SDK client');
    this.dbx = new DropboxSdk({
      clientId: environment.dropboxApiKey,
      fetch,
    });
  }

  private async checkOauthWindowClosed(
    oauthWindow: Window,
    resolve: (value: boolean) => void
  ) {
    if (oauthWindow.closed) {
      if (this.accessToken) {
        this.log(`Obtained OAuth token from OAuth window: ${this.accessToken}`);
        await this.initSdk();
        resolve(this.isAuthenticated);
      } else {
        this.log('Could not obtain OAuth token from OAuth window');
        resolve(false);
      }
    } else {
      setTimeout(
        this.checkOauthWindowClosed.bind(this, oauthWindow, resolve),
        100
      );
    }
  }

  private get accessToken(): string | null {
    return localStorage.getItem(OAUTH_TOKEN_STORAGE_KEY);
  }

  private set accessToken(accessToken: string | null) {
    if (accessToken) {
      localStorage.setItem(OAUTH_TOKEN_STORAGE_KEY, accessToken);
    } else {
      localStorage.removeItem(OAUTH_TOKEN_STORAGE_KEY);
    }
  }

  private readonly log = debug('DropboxStorageProvider');
  private dbx: DropboxSdk;
}

export default DropboxStorageProvider;
