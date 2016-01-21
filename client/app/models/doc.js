/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import DS from 'ember-data';
import Compiler from '../utils/compiler';
import StorageSpec from '../utils/storage-spec';

export default DS.Model.extend({
  title: DS.attr('string'),
  body: DS.attr('string'),
  storageSpec: StorageSpec.create(),

  compiledBody: '',

  compiler: null,
  init() {
    this._super.apply(this, arguments);
    this.set('compiler', Compiler.create({ doc: this }));
  },
  onBodyChanged: Ember.on('init', Ember.observer('body', function() {
    this.get('compiler').compile();
  }))
});
