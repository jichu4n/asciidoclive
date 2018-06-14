/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  beforeModel() {
    this.transitionTo(
      'edit', StorageType.NONE, this.get('settings.scratchId') + 1);
  }
});
