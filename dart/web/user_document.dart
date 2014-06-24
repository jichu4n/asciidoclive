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

  // Returns the document update URI.
  String get _documentPostUri => '${_DOCUMENT_POST_URI}${_documentId}';
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

    /*
    postJson(
        uri,
        toJson(),
        (Map response) => completer.complete(response),
    */
  }

  // Returns the document delete URI.
  String get _documentDeleteUri => '${_DOCUMENT_DELETE_URI}${documentId}';
  // Deletes the document on the server.
  Future delete() {
  }

  // Logger.
  static final Logger _log = new Logger('UserDocument');

  // API endpoints.
  static final String _DOCUMENT_PUT_URI = '/api/v1/documents';
  static final String _DOCUMENT_POST_URI = '/api/v1/documents/';
  static final String _DOCUMENT_DELETE_URI = '/api/v1/documents/';
}
