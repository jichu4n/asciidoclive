/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

function localStorageProperty(propertyName) {
  return {
    get() {
      return window.localStorage[propertyName];
    },
    set(key, value) {
      window.localStorage[propertyName] = value;
      return value;
    }
  };
}

export default Ember.Service.extend({
  init() {
    if (Ember.isNone(window.localStorage) || !window.localStorage) {
      console.warning('Browser does not support local storage!');
      window.localStorage = {};
    } else {
      console.info('Browser supports local storage');
    }
  },

  syncScroll: Ember.computed(localStorageProperty('syncScroll'))
});
