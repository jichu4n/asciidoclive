/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Component.extend({
  // To be injected.
  isVisible: false,

  i18n: Ember.inject.service(),

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
  }),

  faqContent: '',
  fetchFaqContent: Ember.on('init', Ember.observer('i18n.locale', function() {
    Ember.$.get('/assets/faq-' + this.get('i18n.locale') + '.html')
      .then(function(fileContent) {
        this.set('faqContent', fileContent);
      }.bind(this));
  })),
});
