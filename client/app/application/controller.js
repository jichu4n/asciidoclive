/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Dropbox */

import Ember from 'ember';

export default Ember.Controller.extend({
  docStorage: Ember.inject.service(),

  actions: {
    openFromDropbox() {
      Dropbox.choose({
        success: function(selectedFiles) {
          var selectedFile = selectedFiles[0];
          console.info('Dropbox response: %o', selectedFiles);
          Ember.$.get(selectedFile.link).then(function(body) {
            var doc = this.get('store').createRecord('doc', {
              title: selectedFile.name,
              body: body
            });
            this.get('docStorage').set('doc', doc);
          }.bind(this));
        }.bind(this),
        linkType: 'direct',
        multiselect: false
      });
    }
  }
});
