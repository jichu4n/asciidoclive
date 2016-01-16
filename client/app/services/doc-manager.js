/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global asciidoctorJsCompile */

import Ember from 'ember';

export default Ember.Service.extend({
  // The current doc object.
  doc: null,

  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  compileWorker: null,
  compileCount: 0,
  runningCompileRequest: null,
  pendingCompileRequest: null,

  init() {
    this.set('doc', this.get('store').createRecord('doc', {
      title: this.get('i18n').t('defaultTitle'),
      body: this.get('i18n').t('defaultBody')
    }));
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
  compile: Ember.on('init', Ember.observer('doc.body', function() {
    if (Ember.isNone(this.get('doc'))) {
      return;
    }
    this.set('compileCount', this.get('compileCount') + 1);
    var body = this.get('doc.body').toString() || '';
    var request = {
      body: body,
      compileCount: this.get('compileCount'),
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
  })),
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
    this.get('doc').set('compiledBody', ev.data.compiledBody);
  }
});
