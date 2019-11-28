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
export interface Doc extends DocData {
  compiledBody: string;
  isDirty: boolean;
}

export function createDoc(docData?: DocData): Doc {
  let doc: Doc = {
    title: '',
    body: '',
    source: undefined,
    compiledBody: '',
    isDirty: false,
  };
  if (docData) {
    Object.assign(doc, docData);
  }
  return doc;
}
