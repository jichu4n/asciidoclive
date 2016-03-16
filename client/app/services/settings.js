/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

function localStorageProperty(propertyName, defaultValue) {
  return {
    get() {
      if (window.localStorage[propertyName] === undefined) {
        window.localStorage[propertyName] = JSON.stringify(defaultValue);
      }
      return JSON.parse(window.localStorage[propertyName]);
    },
    set(key, value) {
      window.localStorage[propertyName] = JSON.stringify(value);
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

  syncScroll: Ember.computed(localStorageProperty('syncScroll', true))
});
