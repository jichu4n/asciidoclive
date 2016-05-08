/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  storageProviders: Ember.inject.service(),
  settings: Ember.inject.service(),

  isFirstTitleChange: true,

  autoSaveDelayMs: 5 * 1000,

  showSavingStatus: false,
  showSavedStatus: false,
  showSaveErrorStatus: false,
  reopenStorageType: null,
  reopenStorageTypeTranslation: null,

  actions: {
    open(storageType) {
      console.log('Opening from %o', storageType);
      this.get('storageProviders').open(storageType)
      .then(function(storageSpec) {
        this.transitionToRoute(
          'edit',
          storageSpec.get('storageType'),
          storageSpec.get('storagePath'));
      }.bind(this), function(error) {
        console.error('Open error: %o', error);
      });
    },
    openRecent(recentFile) {
      console.log('Opening recent file: %o', recentFile);
      this.transitionToRoute(
        'edit',
        recentFile.storage_type,
        recentFile.storage_path);
    },
    openScratch() {
      this.transitionToRoute('edit', StorageType.NONE, '1');
    },
    save() {
      this.set('showSavedStatus', false);
      this.set('showSaveErrorStatus', false);
      this.set('showSavingStatus', true);
      var prevStorageSpec = this.get('model.storageSpec');
      this.get('storageProviders').save(this.get('model'))
      .then(function(storageSpec) {
        this.set('showSavingStatus', false);
        this.set('showSavedStatus', true);
        this.get('settings').set(
          'recentFiles',
          this.get('settings.recentFiles')
            .reject(function(recentFile) {
              return recentFile.storage_type ===
                prevStorageSpec.get('storageType') &&
                recentFile.storage_path ===
                prevStorageSpec.get('storagePath');
            }));
        this.get('target').send('updateRecentFiles', this.get('model'));
        this.transitionToRoute(
          'edit',
          storageSpec.get('storageType'),
          storageSpec.get('storagePath'));
      }.bind(this), function(error) {
        console.error('Save error: %o', error);
        this.set('showSavingStatus', false);
        this.set('showSaveErrorStatus', true);
      }.bind(this));
    },
    saveAs(storageType) {
      this.set('showSavedStatus', false);
      this.set('showSaveErrorStatus', false);
      this.set('showSavingStatus', true);
      this.get('storageProviders').saveAs(this.get('model'), storageType)
      .then(function(storageSpec) {
        this.set('showSavingStatus', false);
        this.set('showSavedStatus', true);
        if (Ember.isNone(storageSpec)) {
          this.set('reopenStorageType', storageType);
          this.set(
            'reopenStorageTypeTranslation',
            this.get('i18n').t('storageType.' + storageType));
          Ember.$('#reopen-dialog').modal('show');
        } else {
          this.transitionToRoute(
            'edit',
            storageSpec.get('storageType'),
            storageSpec.get('storagePath'));
        }
      }.bind(this), function(error) {
        console.error('Save error: %o', error);
        this.set('showSavingStatus', false);
        this.set('showSaveErrorStatus', true);
      }.bind(this));
    },
    reopen(storageType) {
      Ember.$('#reopen-dialog').modal('hide');
      this.send('open', storageType.toString());
    }
  },
  onTitleChanged: Ember.observer('model.title', function() {
    this.get('target').send('collectTitleTokens', []);
    this.get('target').send('setHeaderSaveTitle', this.get('model.title'));
  }),

  autoSave() {
    if (!this.get('settings.autoSave') ||
        this.get('model.storageSpec.storageType') === StorageType.NONE ||
        !this.get('model.hasDirtyAttributes') ||
        this.get('showSavingStatus')) {
      return;
    }
    console.info('Starting autosave');
    this.send('save');
  },
  onHasDirtyAttributesChanged: Ember.observer(
    'model.hasDirtyAttributes', function() {
      this.get('target').send('collectTitleTokens', []);
      if (this.get('model.hasDirtyAttributes')) {
        Ember.run.later(
          this, this.autoSave, this.get('autoSaveDelayMs'));
      }
    })
});
