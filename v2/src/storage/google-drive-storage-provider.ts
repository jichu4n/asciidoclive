import debug from 'debug';
import delay from 'delay';
import GoogleDriveIcon from 'mdi-material-ui/GoogleDrive';
import {observable} from 'mobx';
import popupCentered from 'popup-centered';
import {DocData, DocSource, StorageSpec} from '../document/doc';
import environment from '../environment/environment';
import StorageProvider from './storage-provider';
import StorageType from './storage-type';

const API_SCRIPT_ELEMENT_ID = 'google-api-js';

const PICKER_POPUP_ID = 'google-drive-picker';
const PICKER_POPUP_WIDTH = 800;
const PICKER_POPUP_HEIGHT = 600;

interface PickerLoadedEvent {
  action: 'loaded';
}

interface PickerCancelledEvent {
  action: 'cancel';
}

/** Partial definition for a document returned from picker. */
interface PickerDocument {
  id: string;
  name: string;
}

interface PickerPickedEvent {
  action: 'picked';
  docs: Array<PickerDocument>;
}

type PickerEvent = PickerLoadedEvent | PickerCancelledEvent | PickerPickedEvent;

const PICKER_POPUP_RESULT_MESSAGE_TYPE = 'google-drive-picker-popup-result';
interface PickerPopupResultMessage {
  type: typeof PICKER_POPUP_RESULT_MESSAGE_TYPE;
  docSource: DocSource;
}

export interface GoogleDriveStorageSpec extends StorageSpec {
  /** Unique ID for the file. */
  id: string;
}

let google: any;

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

  get isAuthenticated() {
    return this.isReady && gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  @observable isReady = false;

  async auth(): Promise<boolean> {
    this.log('Starting auth flow');
    try {
      let user = await gapi.auth2.getAuthInstance().signIn();
      this.log('Logged in!', user);
      return true;
    } catch ({error}) {
      this.log('Log in failed: ', error);
      return false;
    }
  }

  async open(): Promise<DocData | null> {
    this.log('Opening picker window');
    let pickerWindow = popupCentered('/google-drive-picker', PICKER_POPUP_ID, {
      width: PICKER_POPUP_WIDTH,
      height: PICKER_POPUP_HEIGHT,
    });
    if (!pickerWindow) {
      this.log('Unable to open picker window!');
      return null;
    }
    let docSourceResolveFn!: (value: DocSource | null) => void;
    let docSourcePromise = new Promise<DocSource | null>((resolve) => {
      docSourceResolveFn = resolve;
    });
    let onMessageFn = (event: MessageEvent) => {
      if (
        environment.rootUrl &&
        !environment.rootUrl.startsWith(event.origin)
      ) {
        this.log(
          `Ignoring message event from incorrect origin: ${event.origin}`
        );
        return;
      }
      let resultMessage = event.data as PickerPopupResultMessage;
      if (resultMessage.type !== PICKER_POPUP_RESULT_MESSAGE_TYPE) {
        this.log('Ignoring unknown message event', resultMessage);
        return;
      }
      this.log('Received result message event', resultMessage);
      docSourceResolveFn(resultMessage.docSource);
    };
    window.addEventListener('message', onMessageFn, false);
    this.checkPickerWindowClosed(pickerWindow, docSourceResolveFn);
    let docSource = await docSourcePromise;
    window.removeEventListener('message', onMessageFn, false);
    this.log(`Result from picker window: `, docSource);
    if (!docSource) {
      return null;
    }
    let docData = await this.load(docSource);
    if (!docData) {
      throw new Error(
        `Failed to load Google Drive document with storage spec ${JSON.stringify(
          docSource.storageSpec
        )}`
      );
    }
    return docData;
  }

  /** Open a file at the given path from this provider.
   * Returns a PromiseObject that yields the selected doc.
   */
  async load(source: DocSource): Promise<DocData | null> {
    if (source.storageType !== this.storageType) {
      this.log('Invalid DocSource: ', source);
      throw Error('Invalid DocSource');
    }
    let {id} = source.storageSpec as GoogleDriveStorageSpec;
    let getFileContentRequest = gapi.client.drive.files.get({
      fileId: id,
      alt: 'media',
    });
    let getFileMetadataRequest = gapi.client.drive.files.get({
      fileId: id,
    });
    try {
      let [getFileContentResponse, getFileMetadataResponse] = await Promise.all(
        [getFileContentRequest, getFileMetadataRequest]
      );
      this.log('File content response:', getFileContentResponse);
      this.log('File metadata response:', getFileMetadataResponse);
      return {
        source,
        title: getFileMetadataResponse.result.name || '',
        body: getFileContentResponse.body,
      };
    } catch (error) {
      this.log('Failed to load file: ', error);
      return null;
    }
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

  async openWithPickerInPopup() {
    this.log('Opening picker');
    let authResponse = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse();
    this.log('Using auth response: ', authResponse);
    let docSource = await new Promise<DocSource | null>((resolve) => {
      let view = new google.picker.DocsView(google.picker.ViewId.DOCS);
      view.setMimeTypes('text/plain');
      let picker = new google.picker.PickerBuilder()
        .addView(view)
        .setDeveloperKey(environment.googleDriveApiKey!)
        .setAppId(environment.googleDriveAppId!)
        .setOAuthToken(authResponse.access_token)
        .setCallback((event: PickerEvent) => {
          this.log('Picker callback: ', event);
          switch (event.action) {
            case 'picked':
              if (event.docs.length != 1) {
                this.log(`Unexpected number of results: `, event.docs);
              }
              let doc = event.docs[0];
              let storageSpec: GoogleDriveStorageSpec = {id: doc.id};
              resolve({
                storageType: this.storageType,
                storageSpec,
              });
              break;
            case 'cancel':
              resolve(null);
              break;
            default:
              break;
          }
        })
        .setSize(PICKER_POPUP_WIDTH, PICKER_POPUP_HEIGHT)
        .build();
      picker.setVisible(true);
    });
    if (docSource) {
      this.log('Picked document: ', docSource);
      let message: PickerPopupResultMessage = {
        type: PICKER_POPUP_RESULT_MESSAGE_TYPE,
        docSource,
      };
      window.opener && window.opener.postMessage(message, environment.rootUrl);
    } else {
      this.log('Cancelled');
    }
    await delay(100);
    window.close();
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
      gapi.load('client:auth2:picker', () => this.onGoogleApiClientReady());
    } else {
      setTimeout(this.checkGoogleApiClient.bind(this), 100);
    }
  }

  private async onGoogleApiClientReady() {
    this.log('Google API client modules loaded');
    await gapi.client.init({
      apiKey: environment.googleDriveApiKey,
      clientId: environment.googleDriveClientId,
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      ],
      scope: 'https://www.googleapis.com/auth/drive.file',
    });
    google = window['google'];
    this.isReady = true;
    this.log(
      `Google API client ready; user is ${
        this.isAuthenticated ? '' : 'not '
      }authenticated`
    );
  }

  private checkPickerWindowClosed(
    pickerWindow: Window,
    resolve: (value: DocSource | null) => void
  ) {
    if (pickerWindow.closed) {
      this.log('Picker window closed');
      resolve(null);
    } else {
      setTimeout(
        this.checkPickerWindowClosed.bind(this, pickerWindow, resolve),
        100
      );
    }
  }

  private readonly log = debug('GoogleDriveStorageProvider');
}

export default GoogleDriveStorageProvider;
