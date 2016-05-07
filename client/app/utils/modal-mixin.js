/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Mixin.create({
  // Bind this to visibility attribute in parent.
  isVisible: false,

  getModal() {
    return this.$('.modal');
  },

  setupModal: Ember.on('didInsertElement', function() {
    this.getModal().on('hidden.bs.modal', function() {
      this.set('isVisible', false);
    }.bind(this));
  }),

  isVisibleChanged: Ember.observer('isVisible', function() {
    var modal = this.getModal();
    if (this.get('isVisible')) {
      modal.modal('show');
    } else {
      modal.modal('hide');
    }
  })
});
