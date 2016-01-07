/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/** global Opal */

import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  body: DS.attr('string'),

  compiledBody: Ember.computed('body', function() {
    var body = (this.get('body') || '').toString();
    console.log('Compiling: %o', body);
    if (Ember.isEmpty(body)) {
      return '';
    }
    var result = Opal.Asciidoctor.$convert(body, Opal.hash({
    }));
    console.log('Compile result: %o', result);
    return result;
  })
});
