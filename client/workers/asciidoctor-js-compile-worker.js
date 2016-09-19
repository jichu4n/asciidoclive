/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global self, Opal, html_beautify, hljs, global */

var isInWebWorker = typeof document === 'undefined';

function asciidoctorJsCompile(ev) {
  var body = ev.data.body;
  ev.data.body = null;
  var response = JSON.parse(JSON.stringify(ev.data));
  var compiledBody = Opal.Asciidoctor.$convert(body, Opal.hash2(
    [
      'attributes'
    ],
    {
      attributes: ['showtitle']
    }));
  if (response.showHtml) {
    compiledBody = html_beautify(compiledBody, response.htmlBeautifyOptions);
    compiledBody = hljs.highlight(
      'html',
      compiledBody,
      true /* allow malformed input */).value;
  }
  response.compiledBody = compiledBody;
  if (isInWebWorker) {
    self.postMessage(response);
  }
  return response;
}

if (isInWebWorker) {
  console.info('Starting Asciidoctor compile worker');
  // For js-beautify.
  global = {};
  self.importScripts(
    '/assets/asciidoctor.js/asciidoctor-all.min.js',
    '/assets/js-beautify/beautify-html.js',
    '/assets/highlightjs/highlight.pack.min.js');
  self.addEventListener('message', asciidoctorJsCompile);
  html_beautify = global.html_beautify;
}
