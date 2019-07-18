interface InternalCompileRequest {
  // Request ID for logging.
  id: number;
  // Document body.
  body: string;
  // Whether to include page chrome (title, footers etc) or only include inline
  // page content.
  isInline: boolean;
  // Beautify options.
  beautify: {
    // Whether to beautify the output.
    isEnabled: boolean;
    // Options for beautify.
    options?: Object;
  };
  // Whether to return the output as syntax-highlighted HTML.
  shouldHighlight: boolean;
  // Start time of the request.
  startTs: Date;
}
