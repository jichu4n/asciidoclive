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

  settings: Ember.inject.service(),

  compiler: null,
  init() {
    Ember.run(this, function() {
      this._super.apply(this, arguments);
      console.info('Creating compiler');
      this.set('compiler', Compiler.create({
        doc: this,
        settings: this.get('settings')
      }));
    });
  },
  onBodyOrShowHtmlChanged: Ember.on(
    'init',
    Ember.observer('body', 'settings.showHtml', function() {
      this.get('compiler').compile();
    })),
  fileName: Ember.computed('title', function() {
    var title = this.get('title').toString() || '';
    return title.indexOf('.') > -1 ?
      title :
      title + '.adoc';
  }),
  compiledBodyFileName: Ember.computed('title', function() {
    var title = this.get('title').toString() || '';
    return title.indexOf('.') > -1 ?
      title.substr(0, title.lastIndexOf('.')) + '.html' :
      title + '.html';
  }),
  markClean() {
    // See http://stackoverflow.com/a/32275254. This will likely break with
    // newer Ember Data versions.
    var internalModel = this.get('_internalModel');
    internalModel.send('willCommit');
    internalModel._attributes = {};
    internalModel.send('didCommit');
  },
  json: Ember.computed('title', 'body', function() {
    return {
      title: this.get('title'),
      body: this.get('body')
    };
  }),
  compiledBodyForDownload: Ember.computed('body', function() {
    return this.get('compiler').compileForDownload();
  })
});
