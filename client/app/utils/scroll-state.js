/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Object.extend({
  viewportHeight: 0,
  contentHeight: 0,
  scrollTop: 0,

  init() {
    // Force computation of scrollRatio to enable observers.
    this.get('scrollRatio');
  },

  maxScrollTop: Ember.computed('viewportHeight', 'contentHeight', function() {
    return Math.max(
      0, (this.get('contentHeight') - this.get('viewportHeight') || 0));
  }),
  scrollRatio: Ember.computed('scrollTop', 'maxScrollTop', {
    get() {
      if (this.get('maxScrollTop') > 0) {
        var scrollRatio = this.get('scrollTop') / this.get('maxScrollTop');
        return Math.max(0.0, Math.min(1.0, scrollRatio));
      }
      return 1.0;
    },
    set(key, value) {
      value = Math.max(0, Math.min(1.0, value));
      this.set('scrollTop', value * this.get('maxScrollTop'));
      return value;
    }
  }),
  isAtTop: Ember.computed('scrollTop', function() {
    return this.get('scrollTop') <= 0;
  }),
  AT_BOTTOM_THRESHOLD: 50,
  isAtBottom: Ember.computed('scrollTop', 'maxScrollTop', function() {
    return this.get('scrollTop') + this.AT_BOTTOM_THRESHOLD >=
      this.get('maxScrollTop');
  })
});
