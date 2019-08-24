import GoogleDriveIcon from 'mdi-material-ui/GoogleDrive';
import {observable} from 'mobx';
import {DocData, DocSource} from '../document/doc';
import environment from '../environment/environment';
import StorageProvider from './storage-provider';
import StorageType from './storage-type';

class GoogleDriveStorageProvider extends StorageProvider {
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
    return false;
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
}

export default GoogleDriveStorageProvider;
