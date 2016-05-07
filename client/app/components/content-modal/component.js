/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import ModalMixin from '../../utils/modal-mixin';

export default Ember.Component.extend(ModalMixin, {
  // To be injected.
  contentKey: '',
  titleTranslation: null,

  i18n: Ember.inject.service(),

  content: '',
  fetchContent: Ember.on('didInsertElement', Ember.observer(
    'i18n.locale', 'contentKey', function() {
      if (Ember.isEmpty(this.get('contentKey'))) {
        return;
      }
      this.set('content', '');
      Ember.$.get(
        '/assets/' + this.get('contentKey') + '-' +
        this.get('i18n.locale') + '.html')
        .then(function(fileContent) {
          this.set('content', fileContent);
        }.bind(this));
    })),
});
