/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Controller.extend({
  storageProviders: Ember.inject.service(),

  showSavingStatus: false,
  showSavedStatus: false,

  actions: {
    open(storageType) {
      this.get('storageProviders').open(storageType)
      .then(function(storageSpec) {
        this.transitionToRoute(
          'edit', storageSpec.storageType, storageSpec.storagePath);
      }.bind(this));
    },
    save() {
      this.set('showSavingStatus', true);
      this.get('storageProviders').save(this.get('model')).then(function() {
        this.set('showSavingStatus', false);
        this.set('showSavedStatus', true);
      }.bind(this));
    },
    saveAs(storageType) {
    }
  }
});
