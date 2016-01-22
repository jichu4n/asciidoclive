/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Controller.extend({
  storageProviders: Ember.inject.service(),

  showSavingStatus: false,
  showSavedStatus: false,
  showSaveErrorStatus: false,

  actions: {
    open(storageType) {
      this.get('storageProviders').open(storageType)
      .then(function(storageSpec) {
        this.transitionToRoute(
          'edit', storageSpec.storageType, storageSpec.storagePath);
      }.bind(this));
    },
    save() {
      this.set('showSavedStatus', false);
      this.set('showSaveErrorStatus', false);
      this.set('showSavingStatus', true);
      this.get('storageProviders').save(this.get('model')).then(function() {
        this.set('showSavingStatus', false);
        this.set('showSavedStatus', true);
      }.bind(this), function(error) {
        this.set('showSavingStatus', false);
        this.set('showSaveErrorStatus', true);
      }.bind(this));
    },
    saveAs(storageType) {
      this.get('storageProviders').saveAs(this.get('model'), storageType)
      .then(function() {
        console.log('Save as success! arguments: %o', arguments);
      }.bind(this));
    }
  }
});
