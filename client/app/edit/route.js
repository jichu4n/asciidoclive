/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Cookies */

import Ember from 'ember';
import StorageSpec from '../utils/storage-spec';
import StorageType from '../utils/storage-type';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  storageProviders: Ember.inject.service(),
  settings: Ember.inject.service(),

  model(params) {
    if (params.storage_type === StorageType.NONE) {
      /*
      this.get('settings').set('scratchId', parseInt(params.storage_path));
      var docTitle;
      var docContentPromise;
      var shouldMarkAsClean;
      if (!Ember.isNone(this.get('settings.localFile.name')) &&
          !Ember.isNone(this.get('settings.localFile.content'))) {
        docTitle = this.get('settings.localFile.name');
        console.info('Loading local file "%s"', docTitle);
        docContentPromise = Ember.RSVP.Promise.resolve(
          this.get('settings.localFile.content'));
        this.get('settings').set('localFile', null);
        shouldMarkAsClean = false;
      } else {
        console.info('Loading scratch content');
        docTitle = this.get('i18n').t('defaultTitle');
        docContentPromise = Ember.$.get('/assets/scratch.txt');
        shouldMarkAsClean = true;
      }
      return docContentPromise.then(function(docContent) {
        var doc = this.get('store').createRecord('doc', {
          title: docTitle,
          body: docContent,
          storageSpec: StorageSpec.create({
            storageType: StorageType.NONE,
            storagePath: ''
          })
        });
        if (shouldMarkAsClean) {
          doc.markClean();
        }
        return doc;
      }.bind(this));
     */
      return Ember.run(this, function() {
        return this.get('store').createRecord('doc', {
          title: 'Foo',
          body: 'bar',
          storageSpec: StorageSpec.create({
            storageType: StorageType.NONE,
            storagePath: ''
          })
        });
      });
    } else {
      Cookies.set('redirect', {
        route: this.get('routeName'),
        args: [params.storage_type, params.storage_path]
      });
      return this.get('storageProviders').load(StorageSpec.create({
        storageType: params.storage_type,
        storagePath: decodeURIComponent(params.storage_path)
      }));
    }
  },

  isConfirmCloseBound: false,
  afterModel(model) {
    Ember.run(this, function() {
      Cookies.remove('redirect');

      if (!this.get('isConfirmCloseBound')) {
        Ember.$(window).bind('beforeunload', this.confirmClose.bind(this));
        this.set('isConfirmCloseBound', true);
      }

      // Sending actions is not possible inside afterModel :-/
      Ember.run.next(this, function() {
        this.send('setHeaderSaveStorageSpec', model.get('storageSpec'));
        this.send('setHeaderSaveTitle', model.get('title'));
        this.send('updateRecentFiles', model);
      });
    });
  },

  serialize(model) {
    return {
      storage_type: model.get('storageSpec.storageType'),
      storage_path: model.get('storageSpec.storagePath')
    };
  },

  titleToken(model) {
    if (model.get('storageSpec.storageType') === StorageType.NONE &&
        !model.get('hasDirtyAttributes')) {
      return '';
    }
    var title = '';
    if (model.get('hasDirtyAttributes')) {
      title += '*';
    }
    title += model.get('title');
    return title;
  },
  title(tokens) {
    if (Ember.isEmpty(tokens[0])) {
      return this.get('i18n').t('title');
    }
    return tokens[0] + this.get('i18n').t('titleSuffix');
  },

  actions: {
    willTransition(transition) {
      var message = this.confirmClose();
      if (Ember.isNone(message) || window.confirm(message)) {
        this.get('controller.model').markClean();
        return true;
      }
      transition.abort();
    },
    didTransition() {
      this.send('setHeaderActionHandler', this.get('controller'));
    },
    updateRecentFiles(model) {
      if (model.get('storageSpec.storageType') === StorageType.NONE) {
        return;
      }
      var recentFile = this.serialize(model);
      recentFile.title = model.get('title');
      var recentFiles = this.get('settings.recentFiles')
        .reject(function(existingRecentFile) {
          return existingRecentFile.storage_type === recentFile.storage_type &&
            existingRecentFile.storage_path === recentFile.storage_path;
        });
      console.info('Adding to recent files: %o', recentFile);
      recentFiles.unshift(recentFile);
      while (recentFiles.length > this.get('settings.maxRecentFiles')) {
        recentFiles.pop();
      }
      this.get('settings').set('recentFiles', recentFiles);
    }
  },

  confirmClose() {
    var model = this.get('controller.model');
    if (model.get('hasDirtyAttributes')) {
      return this.get('i18n').t('confirmClose', {
        title: model.get('title')
      });
    }
  }
});
