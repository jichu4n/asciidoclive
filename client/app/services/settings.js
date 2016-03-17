/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import { localStorageProperty } from 'ember-local-storage-proxy';

export default Ember.Service.extend({
  syncScroll: Ember.computed(localStorageProperty('syncScroll', true))
});
