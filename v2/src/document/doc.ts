import StorageType from '../storage/storage-type';

export interface DocSource {
  storageType: StorageType;
  path: string;
}

export interface DocData {
  title: string;
  body: string;
  // source: DocSource;
}

export class Doc implements DocData {
  title = '';
  body = '';
  compiledBody: string = '';
  isDirty: boolean = false;
}
