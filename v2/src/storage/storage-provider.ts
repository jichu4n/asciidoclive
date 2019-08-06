import {observable} from 'mobx';
import {DocData} from '../document/doc';
import StorageType from './storage-type';

/** Abtract base class of storage backends. */
abstract class StorageProvider {
  /** The storage type correponding to this provider. */
  abstract get storageType(): StorageType;

  /** Whether this storage provider is enabled in the current environment. */
  abstract get isEnabled(): boolean;

  /** The FontAwesome icon corresponding to this provider. */
  // storageTypeIcon: null,
  /** Whether necessary initialization has completed. */
  @observable isReady = false;

  /** Prompt the user to open a document from this provider.
   * Returns a Promise that yields a StorageSpec.
   */
  abstract open(): Promise<DocData | null>;

  /** Open a file at the given path from this provider.
   * Returns a PromiseObject that yields the selected doc.
   */
  // abstract load(storagePath: string): Promise<DocData>;

  /** Save a document back to the provider.
   * Returns a promise that resolves when the document is saved.
   */
  // abstract save(docData: DocData): Promise<void>;

  /** Prompt the user to save a document to this provider.
   * Returns a promise that resolves when the document is saved.
   */
  // abstract saveAs(docData: DocData): Promise<void>;

  /** Rename a file to the new title inside the doc.
   * Returns a promise that resolves with the new StorageSpec when the file
   * has been renamed.
   */
  // abstract rename(docData: DocData): Promise<void>;
}

export default StorageProvider;
