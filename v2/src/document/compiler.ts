/** The type of output HTML desired. */
export enum OutputType {
  /** Output HTML intended to be interpreted by the browser. */
  PREVIEW,
  /** Output HTML intended to be displayed to the user as source code. */
  DISPLAY_HTML,
  /** Output HTML intended to be downloaded by the user. */
  EXPORT_HTML,
}

export interface CompileRequest {
  /** Document body. */
  body: string;
  /** The type of output desired. */
  outputType: OutputType;
}

export interface CompileResult {
  /** Output HTML. */
  compiledBody: string;
  /** Elapsed time. */
  elapsedTimeMs: number;
}

/** Base class for compiler implementations. */
export abstract class Compiler {
  /** Compiles a document to HTML. */
  abstract compile(request: CompileRequest): Promise<CompileResult>;
}

/** Dummy compiler implementation that just yields the original document. */
export class DummyCompiler extends Compiler {
  constructor(private readonly compileDelayMs: number) {
    super();
  }
  compile(request: CompileRequest) {
    return new Promise<CompileResult>((resolve) => {
      setTimeout(
        () =>
          resolve({
            compiledBody: request.body,
            elapsedTimeMs: this.compileDelayMs,
          }),
        this.compileDelayMs
      );
    });
  }
}

interface ClientCompileRequest extends CompileRequest {
  /** Sequence ID. */
  seq: number;
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
  addRequest(request: CompileRequest) {
    const seq = this.seq++;
    if (this.activeRequest == null) {
      this.activeRequest = {...request, seq};
      this.compile(this.activeRequest);
    } else {
      if (this.nextRequest != null) {
        this.log(this.nextRequest, 'Discarded');
      }
      this.nextRequest = {...request, seq};
      this.log(this.nextRequest, 'Queued');
    }
  }

  private onCompileDone(request: ClientCompileRequest, result: CompileResult) {
    this.log(request, 'Completed');
    setTimeout(() => this.compileResultCallback(result, request), 0);
    if (this.nextRequest != null) {
      this.activeRequest = this.nextRequest;
      this.nextRequest = null;
      this.compile(this.activeRequest);
    }
  }

  private compile(request: ClientCompileRequest) {
    this.log(request, 'Running');
    this.compiler
      .compile(request)
      .then((result) => this.onCompileDone(request, result));
  }

  private log(request: ClientCompileRequest, message: string) {
    console.log(`[DebouncingCompilerClient] [${request.seq}] ${message}`);
  }

  /** Request sequence ID. */
  private seq = 0;
  /** The currently executing request. */
  private activeRequest: ClientCompileRequest | null = null;
  /** The next request to be executed. */
  private nextRequest: ClientCompileRequest | null = null;
}
