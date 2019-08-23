import * as cryptoJs from 'crypto-js';
import debug from 'debug';
import {Dropbox as DropboxSdk, files} from 'dropbox';
import * as _ from 'lodash';
import DropboxIcon from 'mdi-material-ui/Dropbox';
import popupCentered from 'popup-centered';
import {
  DocData,
  DocSource,
  StorageSpec,
  getTitleOrDefault,
} from '../document/doc';
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

interface DropboxStorageSpec extends StorageSpec {
  /** Unique ID for the file, compatible with Dropbox API v2. */
  id: string;
}

const SCRIPT_ELEMENT_ID = 'dropboxjs';
const POPUP_ID = 'dropbox-oauth';
const OAUTH_TOKEN_STORAGE_KEY = 'dropbox-access-token';

let DropboxDropIns: any;

/** Compute Dropbox content hash.
 *
 * Sources:
 *   - https://www.dropbox.com/developers/reference/content-hash
 *   - https://stackoverflow.com/a/47663702
 */
function computeContentHash(body: string): string {
  const BLOCK_SIZE = 4 * 1024 * 1024;
  let hash = cryptoJs.algo.SHA256.create();
  for (let i = 0; i < body.length; i += BLOCK_SIZE) {
    let chunk = body.substr(i, BLOCK_SIZE);
    hash.update(cryptoJs.SHA256(chunk));
  }
  return hash.finalize().toString();
}

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

  get storageTypeIcon() {
    return DropboxIcon;
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
        success: async (files: Array<DropboxChooserResult>) => {
          if (!files || !files.length) {
            this.log('No result from Dropbox chooser');
            resolve(null);
            return;
          }
          let file = files[0];
          this.log(`Got result from Dropbox chooser`, file);
          let storageSpec: DropboxStorageSpec = {id: file.id};
          if (!file.link) {
            this.log('No document content link provided');
            resolve(null);
            return;
          }
          this.log(`Getting document content from ${file.link}`);
          let body = await (await fetch(file.link)).text();
          this.log(`Fetched document content from ${file.link}`);
          resolve({
            title: file.name,
            body,
            source: {
              storageType: this.storageType,
              storageSpec,
            },
          });
        },
        cancel: () => {
          this.log('Dropbox chooser canceled');
          resolve(null);
        },
        linkType: 'direct',
      });
    });
  }

  async load(source: DocSource): Promise<DocData | null> {
    if (source.storageType !== this.storageType) {
      this.log('Invalid DocSource: ', source);
      throw Error('Invalid DocSource');
    }
    let {id} = source.storageSpec as DropboxStorageSpec;
    let downloadUrl: string;
    let title: string;
    try {
      this.log(`Getting download info for file ${id}`);
      let result = await this.dbx.filesGetTemporaryLink({
        path: id,
      });
      this.log(`Successfully got download info for file ${id}:`, result);
      downloadUrl = result.link;
      title = result.metadata.name;
    } catch (e) {
      this.log(`Failed to get download info for file ${id}:`, e);
      return null;
    }
    try {
      this.log(`Getting content for file ${id} at ${downloadUrl}`);
      let body = await (await fetch(downloadUrl)).text();
      this.log(`Successfully fetched content for file ${id} at ${downloadUrl}`);
      return {title, body, source};
    } catch (e) {
      this.log(`Failed to fetch content for file ${id} at ${downloadUrl}:`, e);
      return null;
    }
  }

  async saveAs(docData: DocData) {
    let cursor: string;
    let contentHash: string;
    let contentUrl = `data:text/plain,${encodeURIComponent(docData.body)}`;
    let result = new Promise<DocData | null>((resolve) => {
      DropboxDropIns.save({
        files: [{url: contentUrl, filename: getTitleOrDefault(docData)}],
        success: async () => {
          this.log('Dropbox saver success');
          let {entries} = await this.dbx.filesListFolderContinue({cursor});
          this.log('Entries since initial cursor: ', entries);
          let entry = _.find(entries, {
            content_hash: contentHash,
            '.tag': 'file',
          }) as files.FileMetadataReference | undefined;
          if (entry) {
            this.log(`Found matching entry: `, entry);
            let newDocData: DocData = {
              ...docData,
              title: entry.name,
              source: {
                storageType: this.storageType,
                storageSpec: {
                  id: entry.id,
                },
              },
            };
            resolve(newDocData);
          } else {
            this.log(`No matching entry found `);
            resolve(null);
          }
        },
        cancel: () => {
          this.log('Dropbox saver canceled');
          resolve(null);
        },
        error: (message: string) => {
          this.log(`Dropbox saver error: ${message}`);
          resolve(null);
        },
      });
    });
    contentHash = computeContentHash(docData.body);
    this.log(`Content hash: ${contentHash}`);
    ({cursor} = await this.dbx.filesListFolderGetLatestCursor({
      path: '',
      recursive: true,
    }));
    this.log(`Initial cursor at Dropbox saver open: ${cursor}`);
    return result;
  }

  async save(docData: DocData) {
    if (!docData.source || docData.source.storageType !== this.storageType) {
      this.log('Invalid docData: ', docData);
      throw Error('Invalid docData');
    }
    let {id} = docData.source.storageSpec as DropboxStorageSpec;
    this.log(`Saving to Dropbox file ${id}`);
    try {
      let result = await this.dbx.filesUpload({
        path: id,
        contents: docData.body,
        mode: {'.tag': 'overwrite'},
      });
      this.log(`Successfully saved to Dropbox file ${id}`, result);
      return true;
    } catch (e) {
      this.log(`Failed to save to Dropbox file ${id}: `, e);
      return false;
    }
  }

  async rename(docData: DocData, newTitle: string): Promise<DocData | null> {
    if (!docData.source || docData.source.storageType !== this.storageType) {
      this.log('Invalid docData: ', docData);
      throw Error('Invalid docData');
    }
    let {id} = docData.source.storageSpec as DropboxStorageSpec;
    this.log(`Renaming file ${id} to '${newTitle}'`);
    try {
      let currentPath = (await this.dbx.filesGetMetadata({path: id}))
        .path_display!;
      this.log(`Current path of file ${id} is '${currentPath}'`);
      let newPath =
        currentPath.substr(0, currentPath.lastIndexOf('/') + 1) + newTitle;
      this.log(`Renaming file ${id} to '${newPath}'`);
      let result = await this.dbx.filesMoveV2({
        from_path: id,
        to_path: newPath,
        autorename: true,
      });
      this.log(`Successfully renamed to ${result.metadata.path_display}`);
      return {...docData, title: result.metadata.name};
    } catch (e) {
      this.log(`Failed to save to Dropbox file ${id}: `, e);
      return null;
    }
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
