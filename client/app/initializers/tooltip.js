/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default {
  name: 'tooltip',
  initialize: function() {
    Ember.$(document.body).tooltip({
      selector: '[data-toggle="tooltip"]'
    });
  }
};
