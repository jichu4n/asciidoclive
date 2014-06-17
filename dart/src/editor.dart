/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor page.
*/

import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'base.dart';
import 'asciidoc_editor.dart';
import 'utils.dart';


// Implements the editor page.
class EditorPage extends BasePage {
  EditorPage() : super('editor_header') {
    // Get document ID from JavaScript params.
    if (_editorParams['document_id'] != null) {
      _documentId = _editorParams['document_id'];
    }
  }

  @override
  void registerHeaderEventListeners() {
    super.registerHeaderEventListeners();
    querySelector('#save-button').onClick.listen((_) =>
        _save(promptForSignIn: true));
  }

  // Saves the current document. If promptForSignIn is false, do not show the
  // sign in window if user is not authenticated, but silently fail.
  void _save({bool promptForSignIn: false}) {
    if (userManager.hasAuth) {
      // TODO(cji): Update UI; add title.
      final String sourceText = _editor.sourceText;
      if (sourceText == _editor.lastSavedSourceText) {
        print('Text not changed since last save, not saving.');
        return;
      }
      if (_documentId == null) {
        print('Saving to new document');
        postJson(_DOCUMENT_PUT_URI, {
            'text': sourceText,
        }, (Map response) => _onSaveResult(sourceText, response),
        method: 'PUT');
      } else {
        print('Saving to document ${_documentId}');
        postJson(_documentPostUri, {
            'text': _editor.sourceText,
        }, (Map response) => _onSaveResult(sourceText, response));
      }
    } else {
      if (promptForSignIn) {
        // TODO(cji): Add callback for successful sign in.
        showSignInWindow();
      } else {
        print('User is not authenticated, not saving.');
      }
    }
  }

  // Invoked for a save API call response.
  void _onSaveResult(String sourceText, Map response) {
    // TODO(cji): Update UI.
    if (!response['success']) {
      print('Save failed! Error: ' + response['error_message']);
      return;
    }
    if (response['document_id'] != null) {
      _documentId = response['document_id'];
      print('Created document ${_documentId}');
    } else {
      print('Saved document ${_documentId}');
    }
    _editor.lastSavedSourceText = sourceText;
  }

  // Returns the document update URI.
  String get _documentPostUri => '${_DOCUMENT_POST_URI}${_documentId}';

  // Create document API.
  final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  // Update document API.
  final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  // Handle to editor instance.
  final AsciiDocEditor _editor = new AsciiDocEditor();
  // JavaScript parameters.
  final JsObject _editorParams = context['EditorParams'];
  // Document ID of the current document being edited. This is null for an
  // unsaved document.
  String _documentId;
}

void main() {
  new EditorPage();
}
