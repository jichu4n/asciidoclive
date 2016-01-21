/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Dropbox */

import Ember from 'ember';
import DS from 'ember-data';
import ENV from '../config/environment';
import StorageProvider from '../utils/storage-provider';
import StorageSpec from '../utils/storage-spec';
import StorageType from '../utils/storage-type';

export default StorageProvider.extend({
  storageType: StorageType.DROPBOX,

  client: null,

  init() {
    this.set('client', new Dropbox.Client({
      key: ENV.APP.DROPBOX_APP_KEY
    }));
    this.get('client').authDriver(new Dropbox.AuthDriver.Redirect({
      redirectUrl: ENV.APP.SERVER_URL + '/auth_success'
    }));
  },

  authenticate() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      this.get('client').authenticate(function(error) {
        if (error) {
          reject(error);
          console.log('Failed to authenticate!');
        } else {
          console.log('Successfully authenticated!');
          resolve();
        }
      });
    }.bind(this));
  },

  open() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Dropbox.choose({
        success: function(selectedFiles) {
          resolve(StorageSpec.create({
            storageType: this.get('storageType'),
            storagePath: this.parseStoragePath(selectedFiles[0].link)
          }));
        }.bind(this),
        cancel: reject,
        linkType: 'direct',
        multiselect: false
      });
    }.bind(this));
  },

  load(storagePath) {
    return DS.PromiseObject.create({
      promise: this.authenticate().then(function() {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          this.get('client').readFile(
            storagePath, function(error, fileContent) {
              if (error) {
                reject(error);
              } else {
                resolve(this.get('store').createRecord('doc', {
                  title: storagePath,
                  body: fileContent,
                  storageSpec: StorageSpec.create({
                    storageType: this.get('storageType'),
                    storagePath: storagePath
                  })
                }));
              }
            }.bind(this));
        }.bind(this))
      }.bind(this)).then(function(doc) {
        return doc;
      })
    });
  },

  storagePathRE: /.*\/view\/[^\/]+\/(.*)$/,
  parseStoragePath(link) {
    var match = link.match(this.get('storagePathRE'));
    if (Ember.isNone(match)) {
      console.error('Failed to parse Dropbox download link: %s', link);
      return null;
    }
    return match[1];
  }
});
