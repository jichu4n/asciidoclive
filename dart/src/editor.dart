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
  EditorPage() {
    // Event handlers.
    querySelector('#${_EDIT_TITLE_DIALOG}-dialog .ui-button-cancel')
        .onClick.listen((_) => hideDialog());
    final Element editTitleDialogOkButton =
        querySelector('#${_EDIT_TITLE_DIALOG}-dialog .ui-button-ok');
    editTitleDialogOkButton.onClick.listen((_) {
      hideDialog();
      _setDocumentTitle(_editTitleInput.value.trim());
    });
    _editTitleInput.onKeyPress.listen((KeyboardEvent e) {
      if (e.charCode == 13) {  // Enter key.
        editTitleDialogOkButton.click();
      }
    });
    _lastSavedDocumentTitle = _documentTitle;
  }

  @override
  void registerHeaderEventListeners() {
    super.registerHeaderEventListeners();
    querySelector('#save-button').onClick.listen((_) =>
        _save(blocking: true));
    querySelector('#document-title-button').onClick.listen((_) {
      showDialog(_EDIT_TITLE_DIALOG);
      _editTitleInput.value = _documentTitle == null ? '' : _documentTitle;
      _editTitleInput..focus()..select();
    });
    _onDocumentTitleChange();
  }

  // Saves the current document. If blocking is false, do not show the
  // sign in dialog if user is not authenticated, but silently fail, and do not
  // show the saving progress dialog.
  void _save({bool blocking: false}) {
    if (userManager.hasAuth) {
      // TODO(cji): Update UI; add title.
      final String sourceText = _editor.sourceText;
      if (sourceText == _editor.lastSavedSourceText &&
          _documentTitle == _lastSavedDocumentTitle) {
        print('Not changed since last save, not saving.');
        return;
      }
      if (blocking) {
        showDialog(_SAVING_DIALOG);
      }
      if (_documentId == null) {
        print('Saving to new document');
        postJson(_DOCUMENT_PUT_URI, {
            'text': sourceText,
            'title': _documentTitle,
        }, (Map response) =>
            _onSaveResult(sourceText, _documentTitle, response),
        method: 'PUT');
      } else {
        print('Saving to document ${_documentId}');
        postJson(_documentPostUri, {
            'text': _editor.sourceText,
            'title': _documentTitle,
        }, (Map response) =>
            _onSaveResult(sourceText, _documentTitle, response));
      }
    } else {
      if (blocking) {
        // TODO(cji): Add callback for successful sign in.
        showDialog(SIGN_IN_DIALOG);
      } else {
        print('User is not authenticated, not saving.');
      }
    }
  }

  // Invoked for a save API call response.
  void _onSaveResult(String sourceText, String documentTitle, Map response) {
    // TODO(cji): Update UI.
    if (!response['success']) {
      print('Save failed! Error: ' + response['error_message']);
      return;
    }
    hideDialog();
    if (response['document_id'] != null) {
      _documentId = response['document_id'];
      window.history.replaceState({}, _pageTitle, _documentUri);
      print('Created document ${_documentId}');
    } else {
      print('Saved document ${_documentId}');
    }
    _editor.lastSavedSourceText = sourceText;
    _lastSavedDocumentTitle = documentTitle;
  }

  // Sets the current document title.
  void _setDocumentTitle(String title) {
    if (title.isEmpty) {
      title = null;
    }
    if (title == _documentTitle) {
      print('Document title unchanged, not saving.');
      return;
    }
    _documentTitle = title;
    _onDocumentTitleChange();
    if (_documentId == null) {
      print('Document not yet saved, not saving title change.');
      return;
    }
    _save(blocking: true);
  }

  // Updates the UI following a title change.
  void _onDocumentTitleChange() {
    querySelector('#document-title-button .document-title').setInnerHtml(
        _documentTitleOrDefault);
    document.title = _pageTitle;
  }

  // Returns the document title, or the default if one isn't set.
  String get _documentTitleOrDefault =>
      _documentTitle == null ?  _defaultDocumentTitle : _documentTitle;
  // Returns the page title given the current document title.
  String get _pageTitle =>
      _documentTitle == null ?
      _defaultPageTitle :
      '${_documentTitle}${_pageTitleSuffix}';

  // Returns the document update URI.
  String get _documentPostUri => '${_DOCUMENT_POST_URI}${_documentId}';
  // Returns the URI for editing a document. This should ideally be sent from
  // the server, but oh well.
  String get _documentUri => '/d/${_documentId}';

  // Create document API.
  static final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  // Update document API.
  static final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  // Edit title dialog.
  static final String _EDIT_TITLE_DIALOG = 'edit-title';
  // Saving progress dialog.
  static final String _SAVING_DIALOG = 'saving';
  // DOM elements.
  final TextInputElement _editTitleInput = querySelector(
      '#${_EDIT_TITLE_DIALOG}-dialog input[type="text"]');
  // Handle to editor instance.
  final AsciiDocEditor _editor = new AsciiDocEditor();
  // JavaScript parameters.
  static final JsObject _editorParams = context['EditorParams'];
  // Document ID of the current document being edited. This is null for an
  // unsaved document.
  String _documentId = _editorParams['document_id'];
  // Document title.
  String _documentTitle = _editorParams['document_title'];
  // The document title to use when user has not specified one.
  final String _defaultDocumentTitle = _editorParams['default_document_title'];
  // The page title to use when the document title is not set.
  final String _defaultPageTitle = _editorParams['default_page_title'];
  // The suffix to add to the document title to form the page title.
  final String _pageTitleSuffix = _editorParams['page_title_suffix'];
  // The document title at the last save.
  String _lastSavedDocumentTitle;
}

void main() {
  new EditorPage();
}
