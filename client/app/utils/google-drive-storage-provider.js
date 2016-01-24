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

  allApisLoaded: null,

  init() {
    if (Ember.isNone(window.onGoogleApiLoaded)) {
      console.info('Loading Google API');
      var resolveAuthApi = null, resolvePickerApi = null;
      var authApiLoaded = new Ember.RSVP.Promise(function(resolve) {
        resolveAuthApi = resolve;
      });
      var pickerApiLoaded = new Ember.RSVP.Promise(function(resolve) {
        resolvePickerApi = resolve;
      });
      this.set(
        'allApisLoaded',
        Ember.RSVP.all([authApiLoaded, pickerApiLoaded])
        .then(function() {
          console.info('All Google APIs loaded');
        }));
      window.onGoogleApiLoaded = function() {
        console.info('Google API loaded');
        gapi.load('auth', { callback: resolveAuthApi });
        gapi.load('picker', { callback: resolvePickerApi });
      };
      Ember.run.next(this, function() {
        Ember.$('<script>', {
          src: 'https://apis.google.com/js/api.js?onload=onGoogleApiLoaded'
        }).appendTo(Ember.$('body'));
      });
    }
  }
});
