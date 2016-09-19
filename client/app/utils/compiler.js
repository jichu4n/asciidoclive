/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global asciidoctorJsCompile */

import Ember from 'ember';
import config from '../config/environment';

export default Ember.Object.extend({
  // To be injected.
  doc: null,
  settings: null,

  compileWorker: null,
  compileCount: 0,
  runningCompileRequest: null,
  pendingCompileRequest: null,

  beautifyOptions: {
    'indent_size': 2,
    'wrap_line_length': 80
  },

  init() {
    if (window.Worker) {
      this.set('compileWorker', new Worker(
        '/assets/workers/asciidoctor-js-compile-worker.js'));
      this.get('compileWorker').addEventListener(
        'message', this.onCompileDone.bind(this));
    } else {
      console.log(
        'Browser does not support Web Workers, will compile in main thread.');
    }
  },

  compile: function() {
    if (Ember.isNone(this.get('doc')) || Ember.isNone(this.get('doc.body'))) {
      return;
    }
    this.set('compileCount', this.get('compileCount') + 1);
    var body = this.get('doc.body').toString() || '';
    var request = {
      body: body,
      inline: true,
      compileCount: this.get('compileCount'),
      beautify: this.get('settings.showHtml'),
      beautifyOptions: this.get('beautifyOptions'),
      highlight: this.get('settings.showHtml'),
      serverUrl: config.APP.SERVER_URL,
      startTs: new Date()
    };
    if (Ember.isNone(this.get('compileWorker'))) {
      Ember.run.next(this, this.compileInMainThread, request);
    } else {
      if (Ember.isNone(this.get('runningCompileRequest'))) {
        console.info('[%d] Compiling immediately', this.get('compileCount'));
        this.set('runningCompileRequest', request);
        this.get('compileWorker').postMessage(request);
      } else {
        if (!Ember.isNone(this.get('pendingCompileRequest'))) {
          console.info(
            '[%d] Discarding previously scheduled compiled run',
            this.get('pendingCompileRequest.compileCount'));
        }
        console.info('[%d] Scheduling compile run', this.get('compileCount'));
        this.set('pendingCompileRequest', request);
      }
    }
  },
  compileInMainThread(request) {
    var response = asciidoctorJsCompile({ data: request });
    this.onCompileDone({ data: response });
  },
  onCompileDone(ev) {
    var endTs = new Date();
    console.info(
      '[%d] [%d] Compiled in %dms',
      ev.data.compileCount,
      endTs.valueOf(),
      endTs - (new Date(ev.data.startTs)));
    if (!Ember.isNone(this.get('compileWorker'))) {
      var pendingRequest = this.get('pendingCompileRequest');
      if (Ember.isNone(pendingRequest)) {
        this.set('runningCompileRequest', null);
      } else {
        console.info(
          '[%d] Running previously scheduled compile',
          pendingRequest.compileCount);
        this.set('runningCompileRequest', pendingRequest);
        this.set('pendingCompileRequest', null);
        this.get('compileWorker').postMessage(pendingRequest);
      }
    }
    this.get('doc').set('compiledBody', ev.data.compiledBody);
  },

  compileForDownload: function() {
    if (Ember.isNone(this.get('doc')) || Ember.isNone(this.get('doc.body'))) {
      return '';
    }
    var body = this.get('doc.body').toString() || '';
    var request = {
      body: body,
      inline: false,
      beautify: true,
      beautifyOptions: this.get('beautifyOptions'),
      highlight: false,
      serverUrl: config.APP.SERVER_URL
    };
    return asciidoctorJsCompile({ data: request }).compiledBody;
  }
});
