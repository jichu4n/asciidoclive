/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Route.extend({
  actions: {
    setHeaderActionHandler(controller) {
      this.get('controller').set('headerActionHandler', controller);
    },
    setHeaderSaveStorageSpec(storageSpec) {
      if (storageSpec.get('storageType') === StorageType.NONE) {
        storageSpec = null;
      }
      this.get('controller').set('headerSaveStorageSpec', storageSpec);
    }
  }
});
