/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Dropbox */

import Ember from 'ember';
import DS from 'ember-data';
import StorageType from '../utils/storage-type';
import StorageProvider from '../utils/storage-provider';

export default StorageProvider.extend({
  storageType: StorageType.DROPBOX,

  open() {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.Promise(function(resolve, reject) {
        Dropbox.choose({
          success: function(selectedFiles) {
            var selectedFile = selectedFiles[0];
            Ember.$.get(selectedFile.link).then(function(body) {
              var doc = this.get('store').createRecord('doc', {
                title: selectedFile.name,
                body: body,
                storageType: this.get('storageType')
              });
              resolve(doc);
            }.bind(this), reject);
          }.bind(this),
          cancel: reject,
          linkType: 'direct',
          multiselect: false
        });
      }.bind(this))
    });
  }
});
