import {Compiler, CompileRequest, CompileResult, OutputType} from './compiler';
const asciidoctor = require('asciidoctor')();

declare var Opal: any;
declare var html_beautify: any;
declare var hljs: any;

export interface AsciidocCompileRequest {
  // Document body.
  body: string;
  // Whether to include page chrome (title, footers etc) or only include inline
  // page content.
  isInline: boolean;
  // Whether to beautify the output.
  shouldBeautify: boolean;
  // Options for beautify.
  beautifyOptions?: Object;
  // Whether to return the output as syntax-highlighted HTML.
  shouldHighlight: boolean;
}

export function asciidocCompile(
  request: AsciidocCompileRequest
): CompileResult {
  const startTs = new Date();
  let compiledBody;
  if (request.isInline) {
    compiledBody = asciidoctor.convert(
      request.body,
      Opal.hash2(['attributes'], {
        attributes: ['showtitle'],
      })
    );
  } else {
    var cssPath = '/assets/asciidoctor.js/css/asciidoctor.css';
    compiledBody = asciidoctor.convert(
      request.body,
      Opal.hash2(['header_footer', 'attributes'], {
        header_footer: true,
        attributes: ['nofooter', 'copycss', 'stylesheet=' + cssPath],
      })
    );
  }
  if (request.shouldBeautify) {
    compiledBody = html_beautify(compiledBody, request.beautifyOptions);
  }
  if (request.shouldHighlight) {
    compiledBody = hljs.highlight(
      'html',
      compiledBody,
      true /* allow malformed input */
    ).value;
  }
  return {
    compiledBody,
    elapsedTimeMs: new Date().getTime() - startTs.getTime(),
  };
}

export class BlockingAsciidocCompiler extends Compiler {
  compile(request: CompileRequest) {
    return new Promise<CompileResult>((resolve) => {
      resolve(
        asciidocCompile({
          body: request.body,
          isInline: request.outputType == OutputType.PREVIEW,
          shouldBeautify:
            request.outputType == OutputType.DISPLAY_HTML ||
            request.outputType == OutputType.EXPORT_HTML,
          beautifyOptions: {
            indent_size: 2,
            wrap_line_length: 80,
          },
          shouldHighlight: request.outputType == OutputType.DISPLAY_HTML,
        })
      );
    });
  }
}
