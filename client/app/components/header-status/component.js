/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Component.extend({
  // To be injected.
  show: false,
  durationMs: null,

  classNames: ['header-status'],
  classNameBindings: ['show::hidden'],

  autoHide: Ember.observer('show', function() {
    if (this.get('show') && !Ember.isNone(this.get('durationMs'))) {
      Ember.run.later(
        this, this.set.bind(this, 'show', false), this.get('durationMs'));
    }
  })
});
