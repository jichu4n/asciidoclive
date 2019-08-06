import {IDebug} from 'debug';
import asciidocCompile from './asciidoc-compile';
import {CompileRequest} from './compiler';

// We would ideally use the real type for "self", but this requires --lib
// WebWorker which conflicts with the DOM type library. Even though this file is
// transpiled into a separate output bundle, it still appears to affect the
// transpilation of the main bundle when running in parallel in development :-/
// declare var self: DedicatedWorkerGlobalScope;
declare var self: any;

// Provided by loader.
declare var debug: IDebug;

class AsciidocCompilerWorker {
  constructor() {
    this.log('Starting Asciidoc compile worker');
    self.addEventListener('message', this.onMessage.bind(this));
  }

  private onMessage(ev: MessageEvent) {
    this.log('Received compile request');
    const request: CompileRequest = ev.data;
    const result = asciidocCompile(request);
    this.log('Completed compile request');
    self.postMessage(result);
  }

  private readonly log = debug('AsciidocCompilerWorker');
}

self['asciidocCompilerWorker'] = new AsciidocCompilerWorker();
