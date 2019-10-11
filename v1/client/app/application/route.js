/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Route.extend({
  // Force initialization of storageProviders service at page load. The
  // StorageProviders service will load 3rd party client libraries when
  // initialized. However, since Ember initializes services lazily, this will
  // not happen until the first time we try to open / save / etc, which is too
  // late.
  storageProviders: Ember.inject.service(),
  afterModel() {
    this.get('storageProviders');
  },

  actions: {
    setHeaderActionHandler(controller) {
      this.get('controller').set('headerActionHandler', controller);
    },
    setHeaderSaveStorageSpec(storageSpec) {
      if (storageSpec.get('storageType') === StorageType.NONE) {
        storageSpec = null;
      }
      this.get('controller').set('headerSaveStorageSpec', storageSpec);
    },
    setHeaderSaveTitle(title) {
      this.get('controller').set('headerSaveTitle', title);
    }
  }
});
