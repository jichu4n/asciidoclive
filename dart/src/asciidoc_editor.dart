/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 AsciiDoc editor.
*/

import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:html';
import 'package:crypto/crypto.dart';

class AsciiDocEditor {
  // URL of the AsciiDoc API.
  final String _ASCIIDOC_TO_HTML_URI = '/api/v1/asciidoc-to-html';

  // The amount of time to wait after a source text change before refreshing the
  // output.
  const Duration _REQUEST_DELAY = const Duration(milliseconds: 400);

  // DOM components.
  final TextAreaElement _sourceNode = querySelector('#asciidoc-source');
  final DivElement _outputNode = querySelector('#asciidoc-output');

  AsciiDocEditor() {
    // Register event handler for source text.
    _sourceNode
        ..onChange.listen(onSourceTextChange) 
        ..onKeyDown.listen(onSourceTextChange)
        ..onKeyUp.listen(onSourceTextChange)
        ..onCut.listen(onSourceTextChange)
        ..onPaste.listen(onSourceTextChange);
  }

  // Event handler for source text change.
  void onSourceTextChange(Event e) {
    String sourceText = _sourceNode.value;
    print('Send: ' + sourceText);
    HttpRequest.postFormData(
        _ASCIIDOC_TO_HTML_URI, {
            'text': sourceText,
        }).then(onOutputReceived);
  }

  // Callback that is invoked when HTML output is received from the server.
  void onOutputReceived(HttpRequest request) {
    print('Got response: ' + request.responseText);
    Map response = JSON.decode(request.responseText);
    _outputNode.setInnerHtml(response['html']);
  }
}

void main() {
  AsciiDocEditor editor = new AsciiDocEditor();
}
