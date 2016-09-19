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
    open(storageType, markClean) {
      console.log('Opening from %o', storageType);
      this.get('storageProviders').open(storageType)
      .then(function(storageSpec) {
        if (markClean) {
          this.get('model').markClean();
        }
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
      var docJsonBeforeSave = this.get('model.json');
      this.get('storageProviders').save(this.get('model'))
      .then(function(storageSpec) {
        this.set('showSavingStatus', false);
        this.set('showSavedStatus', true);
        if (JSON.stringify(this.get('model.json')) ===
            JSON.stringify(docJsonBeforeSave)) {
          this.get('model').markClean();
        }
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
        if (prevStorageSpec.get('storageType') !==
            storageSpec.get('storageType') ||
            prevStorageSpec.get('storagePath') !==
            storageSpec.get('storagePath')) {
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
      this.send('open', storageType.toString(), true);
    },
    download() {
      var fileName = this.get('model.fileName');
      var blob = new Blob([this.get('model.body')], { type: 'text/plain' });
      this.downloadBlob(fileName, blob);
    },
    downloadHtml() {
      var fileName = this.get('model.compiledBodyFileName');
      var compiledBodyForDownload = this.get('model.compiledBodyForDownload');
      var blob = new Blob([compiledBodyForDownload], { type: 'text/html' });
      this.downloadBlob(fileName, blob);
    }
  },

  downloadBlob(fileName, blob) {
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      var e = document.createElement('a');
      e.href = URL.createObjectURL(blob);
      e.download = fileName;
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
    }
  },

  onTitleChanged: Ember.observer('model.title', function() {
    this.get('target').send('collectTitleTokens', []);
    this.get('target').send('setHeaderSaveTitle', this.get('model.title'));
  }),
  onHasDirtyAttributesChanged: Ember.observer(
    'model.hasDirtyAttributes', function() {
      this.get('target').send('collectTitleTokens', []);
    }),

  autoSave() {
    if (!this.get('settings.autoSave') ||
        this.get('model.storageSpec.storageType') === StorageType.NONE ||
        !this.get('model.hasDirtyAttributes')) {
      return;
    }
    if (this.get('showSavingStatus')) {
      Ember.run.debounce(this, this.autoSave, this.get('autoSaveDelayMs'));
      return;
    }
    console.info('Starting autosave');
    this.send('save');
  },
  onModelChanged: Ember.observer('model.title', 'model.body', function() {
    Ember.run.debounce(this, this.autoSave, this.get('autoSaveDelayMs'));
  })
});
