/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import DS from 'ember-data';
import DropboxStorageProvider from '../utils/dropbox-storage-provider';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  storageProviders: {},

  init() {
    this._super.apply(this, arguments);
    [
      DropboxStorageProvider.create({ store: this.get('store') })
    ].forEach(function(storageProvider) {
      this.get('storageProviders')[storageProvider.get('storageType')] =
        storageProvider;
    }, this);
  },

  getStorageProvider(storageTypeOrStorageSpec) {
    var storageType = (typeof storageTypeOrStorageSpec === 'string') ?
      storageTypeOrStorageSpec :
      storageTypeOrStorageSpec.get('storageType');
    return this.get('storageProviders')[storageType] || null;
  },

  open(storageType) {
    var storageProvider = this.getStorageProvider(storageType);
    if (Ember.isNone(storageProvider)) {
      return Ember.RSVP.reject();
    }
    return storageProvider.open();
  },

  load(storageSpec) {
    var storageProvider = this.getStorageProvider(storageSpec);
    if (Ember.isNone(storageProvider)) {
      return DS.PromiseObject.create({
        promise: Ember.RSVP.reject()
      });
    }
    return storageProvider.load(storageSpec.get('storagePath'));
  },

  save(doc) {
    var storageProvider = this.getStorageProvider(doc.get('storageSpec'));
    if (Ember.isNone(storageProvider)) {
      return Ember.RSVP.reject();
    }
    return storageProvider.save(doc);
  }
});
