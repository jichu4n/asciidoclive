import debug from 'debug';
import {Compiler, CompileRequest, CompileResult, OutputType} from './compiler';

export interface ClientCompileRequest {
  /** Document body. */
  body: string;
  /** The type of output desired. */
  outputType: OutputType;
}

/** Client interface to document compilers.
 *
 * An instance of CompilerClient manages the compilation of a single document
 * and implements simple debouncing. If multiple changes occur while an earlier
 * compilation process is executing, all pending requests except the last would
 * be dropped.
 */
export class CompilerClient {
  constructor(
    /** The compiler to use. */
    private readonly compiler: Compiler,
    /** A callback to be invoked every time there is a new compilation result
     * available. */
    private readonly compileResultCallback: (
      result: CompileResult,
      request: CompileRequest
    ) => any
  ) {}

  /** Request a new compilation.
   *
   * This request will not be executed if a previous request is currently being
   * executed and another request comes in before it finishes. */
  addRequest(request: ClientCompileRequest) {
    const seq = this.seq++;
    if (this.activeRequest == null) {
      this.activeRequest = {...request, requestId: seq};
      this.compile(this.activeRequest);
    } else {
      if (this.nextRequest != null) {
        this.log(this.nextRequest, 'Discarded');
      }
      this.nextRequest = {...request, requestId: seq};
      this.log(this.nextRequest, 'Queued');
    }
  }

  private onCompileDone(request: CompileRequest, result: CompileResult) {
    this.log(request, 'Completed');
    setTimeout(() => this.compileResultCallback(result, request), 0);
    if (this.nextRequest == null) {
      this.activeRequest = null;
    } else {
      this.activeRequest = this.nextRequest;
      this.nextRequest = null;
      this.compile(this.activeRequest);
    }
  }

  private compile(request: CompileRequest) {
    this.log(request, 'Running');
    this.compiler
      .compile(request)
      .then((result) => this.onCompileDone(request, result));
  }

  private readonly log = debug('CompilerClient');
  /** Request sequence ID. */
  private seq = 0;
  /** The currently executing request. */
  private activeRequest: CompileRequest | null = null;
  /** The next request to be executed. */
  private nextRequest: CompileRequest | null = null;
}
