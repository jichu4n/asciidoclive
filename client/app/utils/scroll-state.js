/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Object.extend({
  viewportHeight: null,
  contentHeight: null,
  scrollTop: null,

  maxScrollTop: Ember.computed('viewportHeight', 'contentHeight', function() {
    return Math.max(0, this.get('contentHeight') - this.get('viewportHeight'));
  }),
  scrollRatio: Ember.computed('scrollTop', 'maxScrollTop', {
    get() {
      return this.get('maxScrollTop') > 0 ?
        Math.min(this.get('scrollTop') / this.get('maxScrollTop'), 1.0) :
        1.0;
    },
    set(key, value) {
      this.set('scrollTop', value * this.get('maxScrollTop'));
      return value;
    }
  })
});
