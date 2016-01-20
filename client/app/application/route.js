/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import StorageType from '../utils/storage-type';

export default Ember.Route.extend({
  docManager: Ember.inject.service(),
  i18n: Ember.inject.service(),

  titleToken() {
    var title = '';
    if (this.get('docManager.doc.storageType') !== StorageType.NONE) {
      title += this.get('i18n').t(
        'storageType.' + this.get('docManager.doc.storageType'));
    }
    title += this.get('docManager.doc.title');
    return title;
  },
  title(tokens) {
    console.info('Tokens: %o', tokens);
    return tokens[0] + this.get('i18n').t('titleSuffix');
  },
  updateTitle: Ember.observer('docManager.doc.title', function() {
    console.info('Updating title');
    this.send('collectTitleTokens', []);
  })
});
