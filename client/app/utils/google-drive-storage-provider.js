/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global gapi */

import Ember from 'ember';
import StorageProvider from '../utils/storage-provider';
import StorageType from '../utils/storage-type';

export default StorageProvider.extend({
  storageType: StorageType.GOOGLE_DRIVE,
  storageTypeIcon: 'google',

  ready: null,

  init() {
    console.info('Loading Google API');
    this.set(
      'ready',
      this.loadGoogleApi().then(function() {
        return Ember.RSVP.all([
          this.loadGoogleApiModule('auth'),
          this.loadGoogleApiModule('picker')
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
    });
  }
});
