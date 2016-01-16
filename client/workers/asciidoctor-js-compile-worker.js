/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global self, Opal */

var isInWebWorker = typeof document === 'undefined';

function asciidoctorJsCompile(ev) {
  var body = ev.data.body;
  ev.data.body = null;
  var response = JSON.parse(JSON.stringify(ev.data));
  response.compiledBody = Opal.Asciidoctor.$convert(body, Opal.hash({
  }));
  if (isInWebWorker) {
    self.postMessage(response);
  }
  return response;
}

if (isInWebWorker) {
  console.info('Starting Asciidoctor compile worker');
  self.importScripts('/assets/asciidoctor.js/asciidoctor-all.min.js');
  self.addEventListener('message', asciidoctorJsCompile);
}
