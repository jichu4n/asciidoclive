/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Main Dart script.
*/

import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:html';

class AsciiDocEditor {
  final String _ASCIIDOC_TO_HTML_URI = '/api/v1/asciidoc-to-html';

  // Event handler for source text change.
  void onSourceTextChange(Event e) {
    String sourceText = e.target.value;
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
    querySelector('#asciidoc-output').setInnerHtml(response['html']);
  }
}

void main() {
  AsciiDocEditor editor = new AsciiDocEditor();

  // Register event handler for source text.
  querySelector('#asciidoc-source')
      ..onChange.listen(editor.onSourceTextChange) 
      ..onKeyDown.listen(editor.onSourceTextChange)
      ..onKeyUp.listen(editor.onSourceTextChange)
      ..onCut.listen(editor.onSourceTextChange)
      ..onPaste.listen(editor.onSourceTextChange);
}
