import {Compiler, CompileRequest, CompileResult, OutputType} from './compiler';

declare var Opal: any;
declare var Asciidoctor: any;
declare var html_beautify: any;
declare var hljs: any;

let asciidoctor: {
  convert: (body: string, options?: any) => string;
} | null = null;

export function asciidocCompile(request: CompileRequest): CompileResult {
  const isInline = request.outputType == OutputType.PREVIEW;
  const shouldBeautify =
    request.outputType == OutputType.DISPLAY_HTML ||
    request.outputType == OutputType.EXPORT_HTML;
  const beautifyOptions = {
    indent_size: 2,
    wrap_line_length: 80,
  };
  const shouldHighlight = request.outputType == OutputType.DISPLAY_HTML;

  if (asciidoctor == null) {
    asciidoctor = Asciidoctor();
  }

  const startTs = new Date();
  let compiledBody;
  if (isInline) {
    compiledBody = asciidoctor!.convert(
      request.body,
      Opal.hash2(['attributes'], {
        attributes: ['showtitle'],
      })
    );
  } else {
    const cssPath = '/assets/asciidoctor.js/css/asciidoctor.css';
    compiledBody = asciidoctor!.convert(
      request.body,
      Opal.hash2(['header_footer', 'attributes'], {
        header_footer: true,
        attributes: ['nofooter', 'copycss', 'stylesheet=' + cssPath],
      })
    );
  }
  if (shouldBeautify) {
    compiledBody = html_beautify(compiledBody, beautifyOptions);
  }
  if (shouldHighlight) {
    compiledBody = hljs.highlight(
      'html',
      compiledBody,
      true /* allow malformed input */
    ).value;
  }
  return {
    requestId: request.requestId,
    compiledBody,
    elapsedTimeMs: new Date().getTime() - startTs.getTime(),
  };
}

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

  private log(message: string) {
    console.log(`[AsyncAsciidocCompiler] ${message}`);
  }

  private readonly worker = new Worker(
    '/assets/worker/asciidoc-compiler-worker-loader.js'
  );
  private readonly pendingRequests = new Map<
    number,
    (result: CompileResult) => void
  >();
}
