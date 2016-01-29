/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global gapi, google, Cookies */

import Ember from 'ember';
import DS from 'ember-data';
import ENV from '../config/environment';
import StorageProvider from '../utils/storage-provider';
import StorageSpec from '../utils/storage-spec';
import StorageType from '../utils/storage-type';

var GOOGLE_API_SCOPE = 'https://www.googleapis.com/auth/drive';

var AuthMode = {
  SILENT: 'SILENT',
  POPUP: 'POPUP',
  REDIRECT: 'REDIRECT'
};

export default StorageProvider.extend({
  storageType: StorageType.GOOGLE_DRIVE,
  storageTypeIcon: 'google',

  ready: null,

  oauthToken: null,

  init() {
    console.info('Loading Google API');
    this.set(
      'ready',
      this.loadGoogleApi().then(function() {
        return Ember.RSVP.all([
          this.loadGoogleApiModule('picker'),
          this.loadGoogleClientApi().then(function() {
            gapi.client.setApiKey(ENV.APP.GOOGLE_API_KEY);
            return Ember.RSVP.all([
              this.loadGoogleClientApiModule('drive', 'v2')
            ]);
          }.bind(this)).then(function() {})
        ]);
      }.bind(this)).then(function() {
        console.info('All Google APIs loaded');
      }));
  },

  loadGoogleApi() {
    return new Ember.RSVP.Promise(function(resolve) {
      window.onGoogleApiLoaded = function() {
        console.info('Google API loaded');
        resolve();
      };
      Ember.$.getScript(
        'https://apis.google.com/js/api.js?onload=onGoogleApiLoaded');
    });
  },
  loadGoogleApiModule(module) {
    return new Ember.RSVP.Promise(function(resolve) {
      gapi.load(module, { callback: resolve });
    }).then(function() {
      console.info('Loaded Google API module %s', module);
    });
  },
  loadGoogleClientApi() {
    return new Ember.RSVP.Promise(function(resolve) {
      window.onGoogleClientApiLoaded = function() {
        console.info('Google client API loaded');
        resolve();
      };
      Ember.$.getScript(
        'https://apis.google.com/js/client.js?onload=onGoogleClientApiLoaded');
    });
  },
  loadGoogleClientApiModule(module, version) {
    return new Ember.RSVP.Promise(function(resolve) {
      gapi.client.load(module, version).then(resolve);
    }).then(function() {
      console.info('Loaded Google client API module %s %s', module, version);
    });
  },

  authenticate(authMode) {
    if (!Ember.isNone(this.get('oauthToken'))) {
      return Ember.RSVP.resolve();
    }
    return this.get('ready').then(function() {
      console.info('Authenticating with Google in mode ' + authMode);
      if (authMode === AuthMode.SILENT ||
          authMode === AuthMode.POPUP) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
          gapi.auth.authorize({
            client_id: ENV.APP.GOOGLE_CLIENT_ID,
            scope: GOOGLE_API_SCOPE,
            immediate: (authMode === AuthMode.SILENT)
          }, function(authResult) {
            if (authResult && !authResult.error) {
              console.info('Authenticated with Google');
              this.set('oauthToken', authResult.access_token);
              resolve(authResult);
            } else {
              if (authMode === AuthMode.SILENT) {
                console.info(
                  'Failed to authenticate with Google in immediate mode');
              } else {
                console.error('Failed to authenticate with Google!');
              }
              reject(authResult);
            }
          }.bind(this));
        }.bind(this));
      } else if (authMode === AuthMode.REDIRECT) {
        return this.authenticate(AuthMode.SILENT).catch(function() {
          var url = 'https://accounts.google.com/o/oauth2/auth?' +
            'redirect_uri=' + encodeURIComponent(
              ENV.APP.SERVER_URL + '/auth_success') + '&' +
            'response_type=code&' +
            'client_id=' + ENV.APP.GOOGLE_CLIENT_ID + '&' +
            'scope=' + encodeURIComponent(GOOGLE_API_SCOPE) + '&' +
            'state=' + encodeURIComponent(Cookies.get('redirect')) + '&' +
            'approval_prompt=auto&' +
            'access_type=online';
          window.location = url;
          console.info('Redirect URL: %s', url);
        });
      } else {
        console.error('Unknown auth mode: %o', authMode);
        return Ember.RSVP.reject();
      }
    }.bind(this)).then(function() {});
  },
  open() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      this.authenticate(AuthMode.POPUP).then(function() {
        var picker = new google.picker.PickerBuilder()
          .addView(
            new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setSelectFolderEnabled(false))
          .setOAuthToken(this.get('oauthToken'))
          .setDeveloperKey(ENV.APP.GOOGLE_API_KEY)
          .setCallback(function(data) {
            if (data[google.picker.Response.ACTION] ===
                google.picker.Action.PICKED) {
              var doc = data[google.picker.Response.DOCUMENTS][0];
              console.info('Selected doc: %o', doc);
              resolve(StorageSpec.create({
                storageType: this.get('storageType'),
                storagePath: doc[google.picker.Document.ID]
              }));
            }
          }.bind(this))
          .build();
        picker.setVisible(true);
      }.bind(this));
    }.bind(this));
  },
  load(storagePath) {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.Promise(function(resolve) {
        this.authenticate(AuthMode.REDIRECT).then(function() {
          gapi.client.drive.files.get({
            fileId: storagePath,
            fields: 'title,downloadUrl,exportLinks'
          }).execute(function(fileMetadata) {
            console.info('Received file metadata: %o', fileMetadata);
            var url = fileMetadata.downloadUrl ||
              fileMetadata.exportLinks['text/plain'];
            console.info('Loading file content from %s', url);
            Ember.$.ajax(url, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + this.get('oauthToken')
              },
              dataType: 'text'
            }).then(function(fileContent) {
              resolve(this.get('store').createRecord('doc', {
                title: fileMetadata.title,
                body: fileContent,
                storageSpec: StorageSpec.create({
                  storageType: this.get('storageType'),
                  storagePath: storagePath
                })
              }));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this))
    });
  }
});
