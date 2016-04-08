/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import DS from 'ember-data';
import DropboxStorageProvider from '../utils/dropbox-storage-provider';
import GoogleDriveStorageProvider from '../utils/google-drive-storage-provider';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  storageProviders: {},

  init() {
    this._super.apply(this, arguments);
    [
      DropboxStorageProvider.create({ store: this.get('store') }),
      GoogleDriveStorageProvider.create({ store: this.get('store') })
    ].forEach(function(storageProvider) {
      console.info(
        'Registering storage provider "%s"',
        storageProvider.get('storageType'));
      this.get('storageProviders')[storageProvider.get('storageType')] =
        storageProvider;
    }, this);
  },

  getStorageProvider(storageTypeOrStorageSpec) {
    var storageType = (typeof storageTypeOrStorageSpec === 'string') ?
      storageTypeOrStorageSpec :
      storageTypeOrStorageSpec.get('storageType');
    var storageProvider = this.get('storageProviders')[storageType] || null;
    if (storageProvider === null) {
      console.error('Could not find storage provider "%s"', storageType);
    }
    return storageProvider;
  },

  open(storageType) {
    console.info('Opening from storage type: %o', storageType);
    var storageProvider = this.getStorageProvider(storageType);
    if (Ember.isNone(storageProvider)) {
      return Ember.RSVP.reject();
    }
    return storageProvider.open();
  },

  load(storageSpec) {
    console.info('Loading from spec: %o', storageSpec);
    var storageProvider = this.getStorageProvider(storageSpec);
    if (Ember.isNone(storageProvider)) {
      return DS.PromiseObject.create({
        promise: Ember.RSVP.reject()
      });
    }
    return storageProvider.load(storageSpec.get('storagePath'));
  },

  save(doc) {
    console.info('Saving doc: %o', doc);
    var storageProvider = this.getStorageProvider(doc.get('storageSpec'));
    if (Ember.isNone(storageProvider)) {
      return Ember.RSVP.reject();
    }
    return storageProvider.save(doc);
  },

  saveAs(doc, storageType) {
    console.info('Saving doc to storage type "%s": %o', storageType, doc);
    var storageProvider = this.getStorageProvider(storageType);
    if (Ember.isNone(storageProvider)) {
      return Ember.RSVP.reject();
    }
    return storageProvider.saveAs(doc);
  },

  rename(doc) {
    console.info('Renaming doc: %o', doc);
    var storageProvider = this.getStorageProvider(doc.get('storageSpec'));
    if (Ember.isNone(storageProvider)) {
      return Ember.RSVP.resolve();
    }
    return storageProvider.rename(doc);
  }
});
