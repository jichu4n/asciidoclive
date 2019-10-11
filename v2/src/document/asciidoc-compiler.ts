import debug from 'debug';
import asciidocCompile from './asciidoc-compile';
import {Compiler, CompileRequest, CompileResult} from './compiler';

export class BlockingAsciidocCompiler extends Compiler {
  compile(request: CompileRequest) {
    return Promise.resolve(asciidocCompile(request));
  }
}

export class AsyncAsciidocCompiler extends Compiler {
  constructor() {
    super();
    this.worker.addEventListener('message', this.onMessage.bind(this));
  }

  compile(request: CompileRequest) {
    return new Promise<CompileResult>((resolve) => {
      this.pendingRequests.set(request.requestId, resolve);
      this.log(`Issuing request with requestId ${request.requestId}`);
      this.worker.postMessage(request);
    });
  }

  private onMessage(ev: MessageEvent) {
    let result: CompileResult = ev.data;
    if (!this.pendingRequests.has(result.requestId)) {
      this.log(
        `Discarding result for unexpected requestId ${result.requestId}`
      );
      return;
    }
    this.log(`Received result for requestId ${result.requestId}`);
    this.pendingRequests.get(result.requestId)!(result);
    this.pendingRequests.delete(result.requestId);
  }

  private readonly log = debug('AsyncAsciidocCompiler');
  private readonly worker = new Worker(
    '/assets/worker/asciidoc-compiler-worker-loader.js'
  );
  private readonly pendingRequests = new Map<
    number,
    (result: CompileResult) => void
  >();
}
