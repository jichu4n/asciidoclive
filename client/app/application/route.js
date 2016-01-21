/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Route.extend({
  actions: {
    setNavbarActionHandler(controller) {
      this.get('controller').set('navbarActionHandler', controller);
    },
    setNavbarSaveStorageSpec(storageSpec) {
      if (storageSpec.get('storageType') === StorageType.NONE) {
        storageSpec = null;
      }
      this.get('controller').set('navbarSaveStorageSpec', storageSpec);
    }
  }
});
