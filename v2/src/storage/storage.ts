import * as _ from 'lodash';
import DropboxStorageProvider from './dropbox-storage-provider';
import StorageProvider from './storage-provider';
import StorageType from './storage-type';

const STORAGE_PROVIDERS = [DropboxStorageProvider];

class Storage {
  constructor() {
    this.storageProviders = STORAGE_PROVIDERS.map(
      (storageProviderClass) => new storageProviderClass()
    );
  }

  getStorageProvider(storageType: StorageType) {
    let storageProvider = _.find(this.storageProviders, [
      'storageType',
      storageType,
    ]);
    if (storageProvider) {
      return storageProvider;
    } else {
      throw Error(`Unknown storage provider ${storageType}`);
    }
  }

  private storageProviders: Array<StorageProvider>;
}

const storage = new Storage();
export default storage;
