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
  })),

  fileName: Ember.computed('title', function() {
    return (this.get('title').toString() || '').indexOf('.') > -1 ?
      this.get('title') :
      this.get('title') + '.adoc';
  }),

  markClean() {
    // See http://stackoverflow.com/a/32275254. This will likely break with
    // newer Ember Data versions.
    var internalModel = this.get('_internalModel');
    internalModel.send('willCommit');
    internalModel._attributes = {};
    internalModel.send('didCommit');
  }
});
