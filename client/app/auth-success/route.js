/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Cookies */

import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    var redirect = Cookies.getJSON('redirect');
    this.transitionTo.apply(this, [redirect.route].concat(redirect.args));
  }
});
