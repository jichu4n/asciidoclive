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
  /** Opaque unique ID. */
  requestId: number;
  /** Document body. */
  body: string;
  /** The type of output desired. */
  outputType: OutputType;
}

export interface CompileResult {
  /** Opaque ID specified in the request.. */
  requestId: number;
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
            requestId: request.requestId,
            compiledBody: request.body,
            elapsedTimeMs: this.compileDelayMs,
          }),
        this.compileDelayMs
      );
    });
  }
}