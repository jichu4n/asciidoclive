/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import ModalMixin from '../../utils/modal-mixin';

export default Ember.Component.extend(ModalMixin, {
  classNames: ['font-size-modal'],

  settings: Ember.inject.service(),

  editorFontSize: Ember.computed('settings.editorFontSize', {
    get() {
      return this.get('settings.editorFontSize');
    },
    set(key, value) {
      value = parseInt(value);
      this.set('settings.editorFontSize', value);
      return value;
    }
  }),
  previewFontSize: Ember.computed('settings.previewFontSize', {
    get() {
      return this.get('settings.previewFontSize');
    },
    set(key, value) {
      value = parseInt(value);
      this.set('settings.previewFontSize', value);
      return value;
    }
  }),

  setupSlider: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.$('#editor-font-size-slider').bootstrapSlider({
        min: this.get('settings.minFontSize'),
        max: this.get('settings.maxFontSize'),
        value: this.get('editorFontSize')
      });
      this.$('#preview-font-size-slider').bootstrapSlider({
        min: this.get('settings.minFontSize'),
        max: this.get('settings.maxFontSize'),
        value: this.get('previewFontSize')
      });
    });
  })
});
