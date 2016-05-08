/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Dropbox, Base64 */

import Ember from 'ember';
import DS from 'ember-data';
import ENV from '../config/environment';
import StorageProvider from '../utils/storage-provider';
import StorageSpec from '../utils/storage-spec';
import StorageType from '../utils/storage-type';

export default StorageProvider.extend({
  storageType: StorageType.DROPBOX,
  storageTypeIcon: 'dropbox',

  client: null,
  ready: null,

  init() {
    this.set(
      'ready',
      (new Ember.RSVP.Promise(function(resolve) {
        this.checkDropinsLoaded(resolve);
      }.bind(this))).then(function() {
        console.info('Dropbox dropins loaded');
      }));
    Ember.$('<script>', {
      src: 'https://www.dropbox.com/static/api/2/dropins.js',
      id: 'dropboxjs',
      'data-app-key': ENV.APP.DROPBOX_APP_KEY,
      async: true
    }).prependTo(Ember.$('head'));
    this.set('client', new Dropbox.Client({
      key: ENV.APP.DROPBOX_APP_KEY
    }));
    this.get('client').authDriver(new Dropbox.AuthDriver.Redirect({
      redirectUrl: ENV.APP.SERVER_URL + '/auth_success'
    }));
  },

  checkDropinsLoaded(onDropinsLoaded) {
    if (Ember.isNone(Dropbox.choose && Dropbox.save)) {
      Ember.run.next(this, this.checkDropinsLoaded, onDropinsLoaded);
    } else {
      onDropinsLoaded.apply(this);
    }
  },

  authenticate() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      this.get('client').authenticate(function(error) {
        if (error) {
          reject(error);
          console.error('Failed to authenticate with Dropbox!');
        } else {
          console.info('Authenticated with Dropbox');
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
                var doc = this.get('store').createRecord('doc', {
                  title: storagePath.split('/').pop(),
                  body: fileContent,
                  storageSpec: StorageSpec.create({
                    storageType: this.get('storageType'),
                    storagePath: storagePath
                  })
                });
                resolve(doc);
              }
            }.bind(this));
        }.bind(this));
      }.bind(this)).then(function(doc) {
        return doc;
      })
    });
  },

  save(doc) {
    if (doc.get('storageSpec.storageType') !== this.get('storageType')) {
      throw new Error(
        'Unexpected storage type: %o', doc.get('storageSpec.storageType'));
    }
    return new Ember.RSVP.Promise(function(resolve, reject) {
      this.rename(doc).then(function(storageSpec) {
        if (storageSpec.get('storageType') !== this.get('storageType')) {
          throw new Error(
            'Unexpected storage type: %o', storageSpec.get('storageType'));
        }
        doc.set('storageSpec', storageSpec);
        this.get('client').writeFile(
          doc.get('storageSpec.storagePath'),
          doc.get('body').toString() || '',
          function(error) {
            if (error) {
              reject(error);
            } else {
              resolve(doc.get('storageSpec'));
            }
          });
      }.bind(this), function(error) {
        reject(error);
      });
    }.bind(this));
  },

  saveAs(doc) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Dropbox.save({
        files: [{
          url: 'data:text/plain;base64,' +
            Base64.encode(doc.get('body').toString() || ''),
          filename: doc.get('fileName')
        }],
        success: resolve,
        cancel: reject,
        error: reject
      });
    }.bind(this));
  },

  rename(doc) {
    if (doc.get('storageSpec.storageType') !== this.get('storageType')) {
      throw new Error(
        'Unexpected storage type: %o', doc.get('storageSpec.storageType'));
    }
    return new Ember.RSVP.Promise(function(resolve, reject) {
      this.authenticate().then(function() {
        var newStoragePath =
          this.splitPath(doc.get('storageSpec.storagePath'))[0] +
          doc.get('fileName');
        if (newStoragePath === doc.get('storageSpec.storagePath')) {
          resolve(doc.get('storageSpec'));
          return;
        }
        console.info(
          'Renaming %s -> %s',
          doc.get('storageSpec.storagePath'),
          newStoragePath);
        this.get('client').move(
          doc.get('storageSpec.storagePath'),
          this.splitPath(doc.get('storageSpec.storagePath'))[0] +
            doc.get('fileName'),
          function(error, fileStat) {
            if (error) {
              reject(error);
            } else {
              console.info('Rename success: %o', fileStat);
              resolve(StorageSpec.create({
                storageType: this.get('storageType'),
                storagePath: newStoragePath
              }));
            }
          }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  storagePathRE: /.*\/view\/[^\/]+\/(.*)$/,
  parseStoragePath(link) {
    var match = link.match(this.get('storagePathRE'));
    if (Ember.isNone(match)) {
      console.error('Failed to parse Dropbox download link: %s', link);
      return null;
    }
    return match[1];
  },
  splitPath(path) {
    var match = path.match(/((?:[^\/]*\/)*)([^\/]*)$/);
    if (Ember.isNone(match)) {
      throw new Error('Failed to split path: %s', path);
    }
    return [match[1], match[2]];
  }
});
