/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Controller.extend({
  docManager: Ember.inject.service(),

  actions: {
    openFromDropbox() {
      this.get('docManager').open(StorageType.DROPBOX);
    }
  }
});
