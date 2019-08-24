import debug from 'debug';
import GoogleDriveIcon from 'mdi-material-ui/GoogleDrive';
import {observable} from 'mobx';
import {DocData, DocSource} from '../document/doc';
import environment from '../environment/environment';
import StorageProvider from './storage-provider';
import StorageType from './storage-type';

const API_SCRIPT_ELEMENT_ID = 'google-api-js';

class GoogleDriveStorageProvider extends StorageProvider {
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
    return StorageType.GOOGLE_DRIVE;
  }

  get storageTypeIcon() {
    return GoogleDriveIcon;
  }

  get displayName() {
    return 'Google Drive';
  }

  get isEnabled() {
    return !!environment.googleDriveApiKey && !!environment.googleDriveClientId;
  }

  get isAuthenticated(): boolean {
    return this.isReady && gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  /** Whether necessary initialization has completed. */
  @observable isReady = false;

  /** Starts the provider's auth flow. */
  auth(): Promise<boolean> {
    return Promise.reject();
  }

  /** Prompt the user to open a document from this provider.
   * Returns a Promise that yields a StorageSpec.
   */
  open(): Promise<DocData | null> {
    return Promise.reject();
  }

  /** Open a file at the given path from this provider.
   * Returns a PromiseObject that yields the selected doc.
   */
  load(source: DocSource): Promise<DocData | null> {
    return Promise.reject();
  }

  /** Save a document back to the provider.
   * Returns a promise that resolves when the document is saved.
   */
  save(docData: DocData): Promise<boolean> {
    return Promise.reject();
  }

  /** Prompt the user to save a document to this provider.
   * Returns a promise that resolves when the document is saved.
   */
  saveAs(docData: DocData): Promise<DocData | null> {
    return Promise.reject();
  }

  /** Rename a file to the new title inside the doc.
   * Returns a promise that resolves with the new StorageSpec when the file
   * has been renamed.
   */
  rename(docData: DocData, newTitle: string): Promise<DocData | null> {
    return Promise.reject();
  }

  private init() {
    let existingScriptEl = document.getElementById(API_SCRIPT_ELEMENT_ID);
    if (!existingScriptEl) {
      let scriptEl = document.createElement('script');
      scriptEl.src = 'https://apis.google.com/js/api.js';
      scriptEl.id = API_SCRIPT_ELEMENT_ID;
      document.body.appendChild(scriptEl);
    }
    this.checkGoogleApiClient();
  }

  private checkGoogleApiClient() {
    if (window['gapi'] && window['gapi']['load']) {
      this.log('Google API client script loaded');
      gapi.load('client:auth2', () => this.onGoogleApiClientReady());
    } else {
      setTimeout(this.checkGoogleApiClient.bind(this), 100);
    }
  }

  private async onGoogleApiClientReady() {
    this.log('Google API auth2 module loaded');
    await gapi.client.init({
      apiKey: environment.googleDriveApiKey,
      clientId: environment.googleDriveClientId,
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      ],
      scope: 'https://www.googleapis.com/auth/drive.file',
    });
    this.isReady = true;
    this.log(
      `Google API client ready; user is ${
        this.isAuthenticated ? '' : 'not '
      }authenticated`
    );
  }

  private readonly log = debug('GoogleDriveStorageProvider');
}

export default GoogleDriveStorageProvider;
