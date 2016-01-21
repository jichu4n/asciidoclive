/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Controller.extend({
  // Injected by route.
  navbarActionHandler: null,
  navbarSaveStorageSpec: null,

  storageProviders: Ember.inject.service(),

  sendToNavbarActionHandler(action, args) {
    var handler = this.get('navbarActionHandler');
    if (Ember.isNone(handler)) {
      console.warning('No navbar action handler registered!');
      return;
    }
    handler.send.apply(handler, [action].concat(
      Array.prototype.slice.call(args)));
  },

  navbarSaveStorageTypeIcon: Ember.computed(
    'navbarSaveStorageSpec.storageType', function() {
      var storageType = this.get('navbarSaveStorageSpec.storageType');
      if (Ember.isNone(storageType)) {
        return null;
      }
      return this.get('storageProviders').getStorageProvider(storageType)
        .get('storageTypeIcon');
    }),

  navbarSaveStorageTypeTranslation: Ember.computed(
    'navbarSaveStorageSpec.storageType', function() {
      var storageType = this.get('navbarSaveStorageSpec.storageType');
      if (Ember.isNone(storageType)) {
        return null;
      }
      return 'storageType.' + storageType;
    }),

  actions: {
    open() {
      this.sendToNavbarActionHandler('open', arguments);
    },
    save() {
      this.sendToNavbarActionHandler('save', arguments);
    }
  }
});
