/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global Opal */

import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  body: DS.attr('string'),

  compileCount: 0,
  compiledBody: Ember.computed('body', function() {
    this.set('compileCount', this.get('compileCount') + 1);
    var startTs = new Date();
    console.info('[%d] [%d] Compiling...',
      this.get('compileCount'),
      startTs.valueOf());
    var body = (this.get('body') || '').toString();
    if (Ember.isEmpty(body)) {
      return '';
    }
    var result = Opal.Asciidoctor.$convert(body, Opal.hash({
    }));
    var endTs = new Date();
    console.info(
      '[%d] [%d] Compiled in %dms',
      this.get('compileCount'),
      endTs.valueOf(),
      endTs - startTs);
    return result;
  })
});
