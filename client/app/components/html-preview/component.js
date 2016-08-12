/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global html_beautify, hljs */

import Ember from 'ember';

export default Ember.Component.extend({
  // To be injected.
  doc: null,
  classNames: ['html-preview'],

  beautifyOptions: {
    'indent_size': 2,
    'wrap_line_length': 80
  },
  compiledBody: Ember.computed('doc.compiledBody',  function() {
    var beautifiedCompiledBody = html_beautify(
      this.get('doc.compiledBody'), this.get('beautifyOptions'));
    var highlightedBeautifiedCompiledBody = hljs.highlight(
      'html',
      beautifiedCompiledBody,
      true /* allow malformed input */).value;
    return highlightedBeautifiedCompiledBody;
  })
});
