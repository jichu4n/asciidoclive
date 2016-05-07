/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Controller.extend({
  // Injected by route.
  headerActionHandler: null,
  headerSaveStorageSpec: null,
  headerSaveTitle: null,

  storageProviders: Ember.inject.service(),
  settings: Ember.inject.service(),

  sendToHeaderActionHandler(action, args) {
    var handler = this.get('headerActionHandler');
    if (Ember.isNone(handler)) {
      console.warning('No navbar action handler registered!');
      return;
    }
    handler.send.apply(handler, [action].concat(
      Array.prototype.slice.call(args)));
  },

  headerSaveStorageTypeIcon: Ember.computed(
    'headerSaveStorageSpec.storageType', function() {
      var storageType = this.get('headerSaveStorageSpec.storageType');
      if (Ember.isNone(storageType)) {
        return null;
      }
      return this.get('storageProviders').getStorageProvider(storageType)
        .get('storageTypeIcon');
    }),

  headerSaveStorageTypeTranslation: Ember.computed(
    'headerSaveStorageSpec.storageType', function() {
      var storageType = this.get('headerSaveStorageSpec.storageType');
      if (Ember.isNone(storageType)) {
        return null;
      }
      return 'storageTypePrefix.' + storageType;
    }),

  isFaqModalVisible: false,
  isAboutModalVisible: false,
  isEditorThemeModalVisible: false,
  isHighlightjsThemeModalVisible: false,
  isFontSizeModalVisible: false,

  actions: {
    open() {
      this.sendToHeaderActionHandler('open', arguments);
    },
    save() {
      this.sendToHeaderActionHandler('save', arguments);
    },
    saveAs() {
      this.sendToHeaderActionHandler('saveAs', arguments);
    },
    toggleSetting(key) {
      this.get('settings').set(key, !this.get('settings.' + key));
    },
    showFaqModal() {
      this.set('isFaqModalVisible', true);
    },
    showAboutModal() {
      this.set('isAboutModalVisible', true);
    },
    showEditorThemeModal() {
      this.set('isEditorThemeModalVisible', true);
    },
    showHighlightjsThemeModal() {
      this.set('isHighlightjsThemeModalVisible', true);
    },
    showFontSizeModal() {
      this.set('isFontSizeModalVisible', true);
    }
  }
});
