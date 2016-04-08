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

  model(params) {
    if (params.storage_type === StorageType.NONE) {
      return Ember.$.get('/assets/scratch.txt').then(function(fileContent) {
        var doc = this.get('store').createRecord('doc', {
          title: this.get('i18n').t('defaultTitle'),
          body: fileContent,
          storageSpec: StorageSpec.create({
            storageType: StorageType.NONE,
            storagePath: ''
          })
        });
        doc.markClean();
        return doc;
      }.bind(this));
    }
    Cookies.set('redirect', {
      route: this.get('routeName'),
      args: [params.storage_type, params.storage_path]
    });
    return this.get('storageProviders').load(StorageSpec.create({
      storageType: params.storage_type,
      storagePath: decodeURIComponent(params.storage_path)
    }));
  },

  afterModel(model) {
    Cookies.remove('redirect');
    this.send('setHeaderSaveStorageSpec', model.get('storageSpec'));
    this.send('setHeaderSaveTitle', model.get('title'));

    Ember.$(window).bind('beforeunload', this.confirmClose.bind(this, model));
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
    didTransition() {
      this.send('setHeaderActionHandler', this.get('controller'));
    }
  },

  confirmClose(model) {
    if (model.get('hasDirtyAttributes')) {
      return this.get('i18n').t('confirmClose', {
        title: model.get('title')
      });
    }
  }
});
