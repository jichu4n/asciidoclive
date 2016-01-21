/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Controller.extend({
  storageProviders: Ember.inject.service(),

  actions: {
    open(storageType) {
      this.get('storageProviders').open(storageType)
      .then(function(storageSpec) {
        this.transitionToRoute(
          'edit', storageSpec.storageType, storageSpec.storagePath);
      }.bind(this));
    },
    save() {
      this.get('storageProviders').save(this.get('model'));
    },
    saveAs(storageType) {
    }
  }
});
