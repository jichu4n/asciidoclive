import StorageType from '../storage/storage-type';

/** Base interface for provider-specific metadata. */
export interface StorageSpec {}

/** Reference to a document in a storage provider.  */
export interface DocSource {
  /** The storage type where the document is stored. */
  storageType: StorageType;
  /** Opaque provider-specific metadata. */
  storageSpec: StorageSpec;
}

/** Document data and metadata. */
export interface DocData {
  title: string;
  body: string;
  source?: DocSource;
}

export const DEFAULT_TITLE = 'Untitled.txt';

export function getTitleOrDefault(docData: DocData) {
  return docData.title || DEFAULT_TITLE;
}

/** Document being edited in an editor session. */
export class Doc implements DocData {
  title = '';
  body = '';
  source: DocSource;
  compiledBody: string = '';
  isDirty: boolean = false;

  constructor(docData?: DocData) {
    if (docData) {
      Object.assign(this, docData);
    }
  }
}
