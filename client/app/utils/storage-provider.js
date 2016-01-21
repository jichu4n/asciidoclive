/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Object.extend({
  // To be injected.
  store: null,

  // The storage type correponding to this provider.
  storageType: StorageType.NONE,
  // Prompt the user to open a document from this provider. Returns a
  // Promise that yields a StorageSpec.
  open() {
    throw new Error('Unimplemented');
  },
  // Open a file at the given path from this provider. Returns a PromiseObject
  // that yields the selected doc.
  load(storagePath) {
    throw new Error('Unimplemented');
  },
  // Prompts the user to save a document to this provider. Returns a promise
  // that resolves when the document is saved.
  saveAs(doc) {
    throw new Error('Unimplemented');
  },
  // Save a document back to the provider. Returns a promise that resolves when
  // the document is saved.
  save(doc) {
    throw new Error('Unimplemented');
  }
});
