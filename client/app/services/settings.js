/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import { localStorageProxy } from 'ember-local-storage-proxy';

export default Ember.Service.extend({
  syncScroll: Ember.computed(localStorageProxy('v1/syncScroll', false))
});
