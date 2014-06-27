/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 User document model.
*/

import 'dart:async';
import 'dart:html';
import 'package:logging/logging.dart';
import 'utils.dart';

// Represents a document. This should closely mirror the Python model.
class UserDocument {
  // The ID of the document. Will be null if not yet saved on the server.
  String documentId;

  String title;
  String text;
  String visibility;

  // Visibility constants.
  static final String PUBLIC = 'public';
  static final String PRIVATE = 'private';

  // Populates a document model from a JSON representation.
  UserDocument.fromJson(Map jsonObject) {
    documentId = jsonObject['document_id'];
    title = jsonObject['title'];
    text = jsonObject['text'];
    visibility = jsonObject['visibility'];
  }

  // Converts a document model to JSON.
  Map toJson() {
    return {
        'document_id': documentId,
        'title': title,
        'text': text,
        'visibility': visibility,
    }
  }

  // Retrieves a document from the server.
  static Future<UserDocument> load(String documentId) {
  }

  // Saves a document on the server.
  Future<Map> save() {
    Completer completer = new Completer();

    String uri;
    String method;
    if (documentId == null) {
      _log.fine('Saving to new document');
      uri = _DOCUMENT_PUT_URI;
      method = 'PUT';
    } else {
      _log.fine('Saving to document ${documentId}');
      uri = _documentPostUri;
      method = 'POST';
    }

    postJson(
        uri,
        toJson(),
        (Map response) {
          if (response['success']) {
            completer.complete(response);
            if (response['document_id'] != null) {
              documentId = response['document_id'];
            }
          } else {
            _log.severe('Save failed! Error: ' + response['error_message']);
            completer.completeError(response);
          }
        },
        onError: (HttpRequest request, ProgressEvent) {
          _log.severe(
              'Save request failed! '
              'Status: ${request.status}, response: ${request.responseText}');
          completer.completeError({
            'success': false,
            'error_message': request.responseText,
          });
        },
        method: method);

    return completer.future;
  }

  // Deletes the document on the server.
  Future<Map> delete() {
    Completer completer = new Completer();
    if (documentId == null) {
      _log.finest('Document not yet saved, not deleting.');
      completer.complete(future);
    } else {
      postJson(
          _documentDeleteUri,
          {},
          (Map response) {
            if (response['success']) {
              completer.complete(response);
            } else {
              _log.severe('Delete failed! Error: ' + response['error_message']);
              completer.completeError(response);
            }
          },
          onError: (HttpRequest request, ProgressEvent) {
            _log.severe(
              'Delete request failed! '
              'Status: ${request.status}, response: ${request.responseText}');
            completer.completeError({
              'success': false,
              'error_message': request.responseText,
            });
          },
          method: 'DELETE');
    }
    return completer.future;
  }

  // Logger.
  static final Logger _log = new Logger('UserDocument');

  // API endpoints.
  static final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  static final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  static final String _DOCUMENT_DELETE_URI = '/api/v1/documents/';
  // Returns the document update URI.
  String get _documentPostUri => '${_DOCUMENT_POST_URI}${_documentId}';
  // Returns the document delete URI.
  String get _documentDeleteUri => '${_DOCUMENT_DELETE_URI}${documentId}';
}
