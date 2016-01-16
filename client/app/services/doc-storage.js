/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Service.extend({
  // The current doc object.
  doc: null,

  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  init() {
    this.set('doc', this.get('store').createRecord('doc', {
      title: this.get('i18n').t('defaultTitle'),
      body: this.get('i18n').t('defaultBody')
    }));
  }
});
