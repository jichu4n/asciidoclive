// Dependencies.
self.importScripts(
  '/assets/asciidoctor/asciidoctor.min.js',
  '/assets/highlightjs/highlight.pack.min.js');
// js-beautify.
self.global = {};
self.importScripts('/assets/js-beautify/beautify-html.js');
self.html_beautify = global.html_beautify;

self.importScripts(
  '/assets/systemjs/s.min.js',
  '/assets/systemjs/named-register.min.js',
  '/assets/worker/asciidoc-compiler-worker.js');
System.import('asciidoc-compiler-worker');
