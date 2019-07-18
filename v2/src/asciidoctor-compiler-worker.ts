import {
  AsciidocCompileRequest,
  asciidocCompile,
} from './document/asciidoc-compiler';
declare var global: any;
declare var self: any;

function onMessage(ev: {data: AsciidocCompileRequest}) {
  const {data: request} = ev;
  if (isInWebWorker) {
    self.postMessage(asciidocCompile(request));
  }
}

const isInWebWorker = typeof document === 'undefined';

if (isInWebWorker) {
  if (typeof console !== 'undefined') {
    console.info('Starting Asciidoctor compile worker');
  }
  // For js-beautify.
  global = {};
  /*
  self.importScripts(
    '/assets/asciidoctor.js/asciidoctor-all.min.js',
    '/assets/js-beautify/beautify-html.js',
    '/assets/highlightjs/highlight.pack.min.js');
  */
  self.addEventListener('message', onMessage);
  // html_beautify = global.html_beautify;
}
