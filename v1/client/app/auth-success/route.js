/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Cookies */

import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    var redirect = this.getRedirect();
    if (Ember.isNone(redirect)) {
      console.error('No redirect info found');
    } else {
      console.info('Redirect: %o', redirect);
      this.transitionTo.apply(this, [redirect.route].concat(redirect.args));
    }
  },
  getRedirect() {
    // 1. Try cookies.
    var redirect = Cookies.getJSON('redirect');
    if (!Ember.isNone(redirect)) {
      return redirect;
    }

    // 2. Try state hash parameter.
    var hashParams = {};
    window.location.hash.substr(1).split('&').forEach(function(segment) {
      var pair = segment.split('=');
      hashParams[pair[0]] = decodeURIComponent(pair[1]);
    });
    if (!Ember.isNone(hashParams.state)) {
      redirect = JSON.parse(hashParams.state);
      return redirect;
    }
  }
});
