/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Component.extend({
  // To be injected.
  contentKey: '',
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

  title: Ember.computed('contentKey', function() {
    return 'modal.' + this.get('contentKey') + '.title';
  }),
  content: '',
  fetchContent: Ember.on('init', Ember.observer(
    'i18n.locale', 'contentKey', function() {
      if (Ember.isEmpty(this.get('contentKey'))) {
        return;
      }
      this.set('content', '');
      Ember.$.get(
        '/assets/' + this.get('contentKey') + '-' +
        this.get('i18n.locale') + '.html')
        .then(function(fileContent) {
          this.set('content', fileContent);
        }.bind(this));
    })),
});
