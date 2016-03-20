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
  // The FontAwesome icon corresponding to this provider.
  storageTypeIcon: null,
  // A promise that resolves when all necessary initialization has completed.
  ready: null,

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
  // Save a document back to the provider. Returns a promise that resolves when
  // the document is saved.
  save(doc) {
    throw new Error('Unimplemented');
  },
  // Prompt the user to save a document to this provider. Returns a promise
  // that resolves when the document is saved.
  saveAs(doc) {
    throw new Error('Unimplemented');
  },
  // Rename a file to the new title inside the doc. Returns a promise that
  // resolves with the new StorageSpec when the file has been renamed.
  rename(doc) {
    throw new Error('Unimplemented');
  }
});
