/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import ModalMixin from '../../utils/modal-mixin';

export default Ember.Component.extend(ModalMixin, {
  classNames: ['theme-modal'],

  settings: Ember.inject.service(),

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
