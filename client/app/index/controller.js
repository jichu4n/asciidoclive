/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global $ */

import Ember from 'ember';

export default Ember.Controller.extend({
  resize: Ember.inject.service(),

  resizeMainLayout() {
    $('#main-layout').css('top', $('.navbar').outerHeight() + 'px');
  },
  init() {
    Ember.run(function() {
      this.get('resize').on('didResize', this.resizeMainLayout.bind(this));
      Ember.run.next(this, this.resizeMainLayout);
    });
  }
});
