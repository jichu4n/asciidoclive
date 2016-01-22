/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Controller.extend({
  // Injected by route.
  headerActionHandler: null,
  headerSaveStorageSpec: null,

  storageProviders: Ember.inject.service(),

  sendToHeaderActionHandler(action, args) {
    var handler = this.get('headerActionHandler');
    if (Ember.isNone(handler)) {
      console.warning('No navbar action handler registered!');
      return;
    }
    handler.send.apply(handler, [action].concat(
      Array.prototype.slice.call(args)));
  },

  headerSaveStorageTypeIcon: Ember.computed(
    'headerSaveStorageSpec.storageType', function() {
      var storageType = this.get('headerSaveStorageSpec.storageType');
      if (Ember.isNone(storageType)) {
        return null;
      }
      return this.get('storageProviders').getStorageProvider(storageType)
        .get('storageTypeIcon');
    }),

  headerSaveStorageTypeTranslation: Ember.computed(
    'headerSaveStorageSpec.storageType', function() {
      var storageType = this.get('headerSaveStorageSpec.storageType');
      if (Ember.isNone(storageType)) {
        return null;
      }
      return 'storageType.' + storageType;
    }),

  actions: {
    open() {
      this.sendToHeaderActionHandler('open', arguments);
    },
    save() {
      this.sendToHeaderActionHandler('save', arguments);
    },
    saveAs() {
      this.sendToHeaderActionHandler('saveAs', arguments);
    }
  }
});
