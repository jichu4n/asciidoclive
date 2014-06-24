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

    querySelector('#${_SHARING_SETTINGS_DIALOG}-dialog .ui-button-ok')
        .onClick.listen((_) {
          hideDialog();
          final RadioButtonInputElement checkedButton = querySelector(
              '#${_SHARING_SETTINGS_DIALOG}-dialog '
              'input[type="radio"]:checked');
          assert(checkedButton != null);
          _documentVisibility = checkedButton.value;
          _save(blocking: true);
        });
    querySelector('#${_SHARING_SETTINGS_DIALOG}-dialog .ui-button-cancel')
        .onClick.listen((_) => hideDialog());
    querySelectorAll('#${_SHARING_SETTINGS_DIALOG}-dialog .option')
        .forEach((Element e) {
          e.onClick.listen((_) =>
              e.querySelector('input[type="radio"]').click());
          final linkElement = e.querySelector('input[type="text"].link');
          if (linkElement != null) {
            linkElement.onClick.listen((_) => linkElement.select());
          }
        });

    querySelector('#${_SAVING_ERROR_DIALOG}-dialog .ui-button-ok')
        .onClick.listen((_) => hideDialog());

    _lastSavedDocumentTitle = _documentTitle;
    _lastSavedSourceText = _editor.sourceText.trim();
    _lastSavedDocumentVisibility = _documentVisibility;

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
    querySelector('#share-button').onClick.listen((_) {
      querySelectorAll(
          '#${_SHARING_SETTINGS_DIALOG}-dialog input[type="radio"]')
          .forEach((RadioButtonInputElement e) {
            e.checked = e.value == _documentVisibility;
          });
      showDialog(_SHARING_SETTINGS_DIALOG);
    });
    querySelector('#delete-button').onClick.listen((_) =>
      showDialog(_CONFIRM_DELETE_DIALOG));
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
            'visibility': _documentVisibility,
        }, (Map response) =>
            _onSaveResult(
                sourceText, _documentTitle, _documentVisibility,
                blocking, response),
        method: 'PUT');
      } else {
        print('Saving to document ${_documentId}');
        postJson(_documentPostUri, {
            'text': _editor.sourceText,
            'title': _documentTitle,
            'visibility': _documentVisibility,
        }, (Map response) =>
            _onSaveResult(
                sourceText, _documentTitle, _documentVisibility,
                blocking, response));
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
      String sourceText, String documentTitle, String documentVisibility,
      bool blocking,
      Map response) {
    new Timer(_SAVING_BUTTON_HIDE_DELAY, _hideSavingButton);
    if (!response['success']) {
      print('Save failed! Error: ' + response['error_message']);
      showDialog(_SAVING_ERROR_DIALOG);
      return;
    }
    if (blocking) {
      showDialogWithTimeout(_SAVING_SUCCESS_DIALOG);
    }
    if (response['document_id'] != null) {
      _documentId = response['document_id'];
      window.history.replaceState({}, _pageTitle, _documentUri);
      print('Created document ${_documentId}');
    } else {
      print('Saved document ${_documentId}');
    }
    _lastSavedSourceText = sourceText;
    _lastSavedDocumentTitle = documentTitle;
    _lastSavedDocumentVisibility = documentVisibility;
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
      _documentTitle != _lastSavedDocumentTitle ||
      _documentVisibility != _lastSavedDocumentVisibility);

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
      _lastSavedDocumentVisibility = _documentVisibility;
      window.location.assign(ROOT_URI);
    });
  }

  // Create document API.
  static final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  // Update document API.
  static final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  // Delete document API.
  static final String _DOCUMENT_DELETE_URI = '/api/v1/documents/';
  // Dialogs.
  static final String _EDIT_TITLE_DIALOG = 'edit-title';
  static final String _SAVING_DIALOG = 'saving';
  static final String _SAVING_SUCCESS_DIALOG = 'saving-success';
  static final String _SAVING_NOT_CHANGED_DIALOG = 'saving-not-changed';
  static final String _CONFIRM_DELETE_DIALOG = 'confirm-delete';
  static final String _SHARING_SETTINGS_DIALOG = 'sharing-settings';
  static final String _DELETING_DIALOG = 'deleting';
  static final String _DELETE_SUCCESS_DIALOG = 'delete-success';
  static final String _SAVING_ERROR_DIALOG = 'saving-error';
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
  // The visibility of the document, as a string.
  String _documentVisibility = _editorParams['document_visibility'];
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
  // The visibility of the document at the last save.
  String _lastSavedDocumentVisibility = null;
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
