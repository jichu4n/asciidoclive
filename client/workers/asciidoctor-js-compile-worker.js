/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global self, Opal */

self.importScripts('/assets/asciidoctor.js/asciidoctor-all-min.js');

self.addEventListener('message', function(ev) {
  var body = ev.data.body;
  ev.data.body = null;
  var response = JSON.parse(JSON.stringify(ev.data));
  response.compiledBody = Opal.Asciidoctor.$convert(body, Opal.hash({
  }));
  self.postMessage(response);
});
