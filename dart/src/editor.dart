/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor page.
*/

import 'dart:async';
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

    querySelector('#${_CONFIRM_DELETE_DIALOG}-dialog .ui-button-cancel')
        .onClick.listen((_) => hideDialog());
    querySelector('#${_CONFIRM_DELETE_DIALOG}-dialog .ui-button-delete')
        .onClick.listen((_) => _deleteDocument());

    _lastSavedDocumentTitle = _documentTitle;
    _lastSavedSourceText = _editor.sourceText.trim();

    window.onBeforeUnload.listen(_onBeforeUnload);

    _saveTimer = new Timer.periodic(_SAVE_INTERVAL, (_) => _save());
  }

  @override
  void registerHeaderEventListeners() {
    super.registerHeaderEventListeners();
    querySelector('#open-button').onClick.listen((_) {
      if (userManager.isSignedIn) {
        window.location.assign(_DOCUMENT_LIST_URI);
      } else {
        showDialog(SIGN_IN_DIALOG);
      }
    });
    _saveButton.onClick.listen((_) =>
        _save(blocking: true));
    querySelector('#document-title-button').onClick.listen((_) {
      showDialog(_EDIT_TITLE_DIALOG);
      _editTitleInput.value = _documentTitle == null ? '' : _documentTitle;
      _editTitleInput..focus()..select();
    });
    querySelector('#delete-button').onClick.listen((_) {
      showDialog(_CONFIRM_DELETE_DIALOG);
    });
    _onDocumentTitleChange();
  }

  @override
  void onAuthStateChange() {
    if (!userManager.isSignedIn && _documentId != null) {
      window.location.assign(ROOT_URI);
    } else {
      super.onAuthStateChange();
    }
  }

  // Saves the current document. If blocking is false, do not show the
  // sign in dialog if user is not authenticated, but silently fail, and do not
  // show the saving progress dialog.
  void _save({bool blocking: false}) {
    if (userManager.isSignedIn) {
      // TODO(cji): Update UI; add title.
      final String sourceText = _editor.sourceText;
      if (!_isDirty) {
        print('Not changed since last save, not saving.');
        if (blocking) {
          showDialogWithTimeout(_SAVING_NOT_CHANGED_DIALOG);
        }
        return;
      }
      if (blocking) {
        showDialog(_SAVING_DIALOG);
      }
      _showSavingButton();
      if (_documentId == null) {
        print('Saving to new document');
        postJson(_DOCUMENT_PUT_URI, {
            'text': sourceText,
            'title': _documentTitle,
        }, (Map response) =>
            _onSaveResult(sourceText, _documentTitle, blocking, response),
        method: 'PUT');
      } else {
        print('Saving to document ${_documentId}');
        postJson(_documentPostUri, {
            'text': _editor.sourceText,
            'title': _documentTitle,
        }, (Map response) =>
            _onSaveResult(sourceText, _documentTitle, blocking, response));
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
  void _onSaveResult(
      String sourceText, String documentTitle, bool blocking, Map response) {
    // TODO(cji): Update UI.
    if (!response['success']) {
      print('Save failed! Error: ' + response['error_message']);
      return;
    }
    if (blocking) {
      showDialogWithTimeout(_SAVING_SUCCESS_DIALOG);
    }
    new Timer(_SAVING_BUTTON_HIDE_DELAY, _hideSavingButton);
    if (response['document_id'] != null) {
      _documentId = response['document_id'];
      window.history.replaceState({}, _pageTitle, _documentUri);
      print('Created document ${_documentId}');
    } else {
      print('Saved document ${_documentId}');
    }
    _lastSavedSourceText = sourceText;
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

  // Shows the saving button.
  void _showSavingButton() {
    _saveButton.classes.add('hidden');
    _savingButton.classes.remove('hidden');
  }
  // Hides the saving button.
  void _hideSavingButton() {
    _saveButton.classes.remove('hidden');
    _savingButton.classes.add('hidden');
  }

  // Returns the document update URI.
  String get _documentPostUri => '${_DOCUMENT_POST_URI}${_documentId}';
  // Returns the URI for editing a document. This should ideally be sent from
  // the server, but oh well.
  String get _documentUri => '/d/${_documentId}';
  // The URI for the document list.
  final String _DOCUMENT_LIST_URI = '/home';

  // Returns whether the user has made unsaved modifications.
  bool get _isDirty => (
      _editor.sourceText.trim() != _lastSavedSourceText ||
      _documentTitle != _lastSavedDocumentTitle);

  // Callback invoked when the user attempts to close the window.
  void _onBeforeUnload(BeforeUnloadEvent e) {
    if (_isDirty) {
      e.returnValue = _unloadConfirmationMessage;
    }
  }

  // Returns the document delete URI.
  String get _documentDeleteUri => '${_DOCUMENT_DELETE_URI}${_documentId}';
  // Deletes the current document.
  void _deleteDocument() {
    if (_documentId != null) {
      postJson(_documentDeleteUri, {}, _onDeleteResult, method: 'DELETE');
      showDialog(_DELETING_DIALOG);
    } else {
      _onDeleteResult({'success': true});
    }
  }
  // Callback invoked on delete result.
  void _onDeleteResult(Map response) {
    if (!response['success']) {
      print('Delete failed! Error: ' + response['error_message']);
      return;
    }
    showDialogWithTimeout(_DELETE_SUCCESS_DIALOG);
    new Timer(BasePage.DEFAULT_DIALOG_TIMEOUT, () {
      _lastSavedSourceText = _editor.sourceText.trim();
      _lastSavedDocumentTitle = _documentTitle;
      window.location.assign(ROOT_URI);
    });
  }

  // Create document API.
  static final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  // Update document API.
  static final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  // Delete document API.
  static final String _DOCUMENT_DELETE_URI = '/api/v1/documents/';
  // Edit title dialog.
  static final String _EDIT_TITLE_DIALOG = 'edit-title';
  // Saving progress dialog.
  static final String _SAVING_DIALOG = 'saving';
  // Saving success dialog.
  static final String _SAVING_SUCCESS_DIALOG = 'saving-success';
  // Dialog to show if the user clicks save without a change.
  static final String _SAVING_NOT_CHANGED_DIALOG = 'saving-not-changed';
  // Dialog for confirming document deletion.
  static final String _CONFIRM_DELETE_DIALOG = 'confirm-delete';
  // Deletion progress dialog.
  static final String _DELETING_DIALOG = 'deleting';
  // Dialog shown after deletion.
  static final String _DELETE_SUCCESS_DIALOG = 'delete-success';
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
  // The source text at the last save.
  String _lastSavedSourceText = null;
  // Message to show when attempting to unload an editor with changes.
  final String _unloadConfirmationMessage = (
      querySelector('#unload-confirmation-message').text
      .replaceAllMapped(
          new RegExp(r'([^\n])\n([^\n])', multiLine: true),
          (Match m) => '${m[1]} ${m[2]}')
      .replaceAll(new RegExp(r'[ ]+'), ' '));
  // DOM elements.
  final Element _saveButton = querySelector('#save-button');
  final Element _savingButton = querySelector('#saving-button');
  // Timer for auto saving.
  Timer _saveTimer;
  // Auto save interval.
  static const Duration _SAVE_INTERVAL = const Duration(seconds: 5);
  // How long to wait before dismissing the saving button.
  static const Duration _SAVING_BUTTON_HIDE_DELAY =
      const Duration(milliseconds: 800);
}

void main() {
  new EditorPage();
}
