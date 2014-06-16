/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor page.
*/

import 'dart:convert';
import 'dart:html';
import 'base.dart';
import 'asciidoc_editor.dart';
import 'utils.dart';


// Implements the editor page.
class EditorPage extends BasePage {
  EditorPage() : super('editor_header') {
  }

  @override
  void registerHeaderEventListeners() {
    super.registerHeaderEventListeners();
    querySelector('#save-button').onClick.listen((_) => _save());
  }

  // Saves the current document.
  void _save() {
    if (userManager.hasAuth) {
      // TODO(cji): Update UI; add title.
      if (_documentId == null) {
        print('Saving to new document');
        postJson(_DOCUMENT_PUT_URI, {
            'text': _editor.sourceText,
        }, _onSaveResult, method: 'PUT');
      } else {
        print('Saving to document ${_documentId}');
        postJson(_documentPostUri, {
            'text': _editor.sourceText,
        }, _onSaveResult);
      }
    } else {
      // TODO(cji): Add callback for successful sign in.
      showSignInWindow();
    }
  }

  // Invoked for a save API call response.
  void _onSaveResult(Map response) {
    // TODO(cji): Update UI.
    if (!response['success']) {
      print('Save failed! Error: ' + response['error_message']);
      return;
    }
    if (response['document_id'] != null) {
      _documentId = response['document_id'];
      print('Created document ${_documentId}');
    }
  }

  // Returns the document update URI.
  String get _documentPostUri => '${_DOCUMENT_POST_URI}${_documentId}';

  // Create document API.
  final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  // Update document API.
  final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  // Handle to editor instance.
  final AsciiDocEditor _editor = new AsciiDocEditor();
  // Document ID of the current document being edited. This is null for an
  // unsaved document.
  String _documentId;
}

void main() {
  new EditorPage();
}
