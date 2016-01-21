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
        return this.get('store').createRecord('doc', {
          title: this.get('i18n').t('defaultTitle'),
          body: fileContent,
          storageSpec: StorageSpec.create({
            storageType: StorageType.NONE,
            storagePath: ''
          })
        });
      }.bind(this));
    }
    Cookies.set('redirect', {
      route: this.get('routeName'),
      args: [params.storage_type, params.storage_path]
    });
    return this.get('storageProviders').load(StorageSpec.create({
      storageType: params.storage_type,
      storagePath: params.storage_path
    }));
  },

  afterModel() {
    Cookies.remove('redirect');
  },

  serialize(doc) {
    return {
      storage_type: doc.get('storageSpec.storageType'),
      storage_path: doc.get('storageSpec.storagePath')
    };
  },

  titleToken(model) {
    var title = '';
    if (model.get('storageSpec.storageType') !== StorageType.NONE) {
      title += this.get('i18n').t(
        'storageType.' + model.get('storageSpec.storageType'));
    }
    title += model.get('title');
    return title;
  },
  title(tokens) {
    return tokens[0] + this.get('i18n').t('titleSuffix');
  }
});
