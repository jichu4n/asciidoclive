/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var Funnel = require('broccoli-funnel');
var asciidocToHtml = require('broccoli-asciidoc');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    fingerprint: {
      exclude: [
        'assets/ace-editor'
      ]
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import(
    'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
    { type: 'vendor' });
  var bootstrapFonts = new Funnel(
    'bower_components/bootstrap-sass/assets/fonts/bootstrap',
    { destDir: '/fonts' });
  app.import(
    'bower_components/jquery-ui/jquery-ui.js',
    { type: 'vendor' });
  app.import(
    'bower_components/dropbox/dropbox.js',
    { type: 'vendor' });
  app.import(
    'bower_components/js-cookie/src/js.cookie.js',
    { type: 'vendor' });
  app.import(
    'bower_components/js-base64/base64.js',
    { type: 'vendor' });
  app.import(
    'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js',
    { type: 'vendor' });
  app.import(
    'bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css',
    { type: 'vendor' });

  // Keep asciidoctor.js and compile worker as separate files for use with Web
  // Worker, but also import them into the main app for older browsers.
  var asciidoctor = new Funnel(
    'bower_components/asciidoctor.js/dist',
    {
      destDir: '/assets/asciidoctor.js',
      files: ['asciidoctor-all.min.js']
    });
  var workers = new Funnel(
    'workers',
    { destDir: '/assets/workers' });
  app.import(
    'bower_components/asciidoctor.js/dist/asciidoctor-all.js',
    { type: 'vendor' });

  var aceEditor = new Funnel(
    'bower_components/ace-builds/src-min-noconflict',
    { destDir: '/assets/ace-editor' });

  var asciidocHtmlAssets = new Funnel(
    asciidocToHtml('public/assets'),
    { destDir: '/assets' });

  return app.toTree([
    bootstrapFonts,
    asciidoctor,
    aceEditor,
    workers,
    asciidocHtmlAssets
  ]);
};
