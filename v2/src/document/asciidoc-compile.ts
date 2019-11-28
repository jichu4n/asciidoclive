import {CompileRequest, CompileResult, OutputType} from './compiler';

declare var Opal: any;
declare var Asciidoctor: any;
declare var html_beautify: any;
declare var hljs: any;

let asciidoctor: {
  convert: (body: string, options?: any) => string;
};

export default function asciidocCompile(
  request: CompileRequest
): CompileResult {
  const isInline = request.outputType === OutputType.PREVIEW;
  const shouldBeautify =
    request.outputType === OutputType.DISPLAY_HTML ||
    request.outputType === OutputType.EXPORT_HTML;
  const beautifyOptions = {
    indent_size: 2,
    wrap_line_length: 80,
  };
  const shouldHighlight = request.outputType === OutputType.DISPLAY_HTML;

  if (asciidoctor === undefined) {
    asciidoctor = Asciidoctor();
  }

  const startTs = new Date();
  let compiledBody;
  if (isInline) {
    compiledBody = asciidoctor.convert(
      request.body,
      Opal.hash2(['attributes'], {
        attributes: ['showtitle'],
      })
    );
  } else {
    const cssPath = '/assets/asciidoctor/css/asciidoctor.css';
    compiledBody = asciidoctor.convert(
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
