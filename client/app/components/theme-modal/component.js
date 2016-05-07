/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import ModalMixin from '../../utils/modal-mixin';

export default Ember.Component.extend(ModalMixin, {
  // To be injected.
  themes: [],
  themeName: null,
  titleTranslation: null,

  classNames: ['theme-modal'],

  displayedThemes: Ember.computed('themes', 'themeName', function() {
    var themeName = this.get('themeName');
    return this.get('themes').map(function(theme) {
      return {
        name: theme.name,
        value: theme.value,
        isSelected: theme.name === themeName
      };
    });
  }),

  actions: {
    setTheme(themeName) {
      this.set('themeName', themeName);
      console.log('Set theme to: %s', this.get('themeName'));
    }
  }
});
