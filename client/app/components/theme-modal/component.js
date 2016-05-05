/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['theme-modal'],

  settings: Ember.inject.service(),

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

  themes: Ember.computed('settings.THEMES', 'settings.themeName', function() {
    var themeName = this.get('settings.themeName');
    return this.get('settings.THEMES').map(function(theme) {
      return {
        name: theme.name,
        value: theme.value,
        isSelected: theme.name === themeName
      };
    });
  }),

  actions: {
    setTheme(themeName) {
      this.get('settings').set('themeName', themeName);
      console.log('Set theme to: %s', this.get('settings.theme'));
    }
  }
});
