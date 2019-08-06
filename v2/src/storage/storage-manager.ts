import * as _ from 'lodash';
import DropboxStorageProvider from './dropbox-storage-provider';
import StorageProvider from './storage-provider';
import StorageType from './storage-type';

const STORAGE_PROVIDERS = [DropboxStorageProvider];

class StorageManager {
  constructor() {
    this.storageProviders = STORAGE_PROVIDERS.map(
      (storageProviderClass) => new storageProviderClass()
    );
  }

  getStorageProvider<T extends StorageProvider = StorageProvider>(
    storageType: StorageType
  ) {
    let storageProvider = _.find(this.storageProviders, [
      'storageType',
      storageType,
    ]);
    if (storageProvider) {
      return storageProvider as T;
    } else {
      throw Error(`Unknown storage provider ${storageType}`);
    }
  }

  private storageProviders: Array<StorageProvider>;
}

const storageManager = new StorageManager();
export default storageManager;
