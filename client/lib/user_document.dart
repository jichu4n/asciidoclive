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
    };
  }

  // Retrieves the list of document IDs owned by the current user.
  static Future<List<String>> list() {
    return callApi(_DOCUMENT_URI_BASE, {}, method: 'GET')
        .then((Map response) => response['document_ids']);
  }

  // Retrieves a document from the server.
  static Future<UserDocument> load(String documentId) {
    return callApi(_getDocumentUri(documentId), {}, method: 'GET')
        .then((Map response) => new UserDocument.fromJson(response));
  }

  // Returns a scratch document.
  static Future<UserDocument> loadScratch() {
    return HttpRequest.getString(_SCRATCH_DOCUMENT_URI)
        .then((String text) => new UserDocument.fromJson({
            'text': text,
            'visibility': PRIVATE,
        }));
  }

  // Saves a document on the server.
  Future<Map> save() {
    String uri;
    String method;
    if (documentId == null) {
      _log.fine('Saving to new document');
      uri = _DOCUMENT_URI_BASE;
      method = 'PUT';
    } else {
      _log.fine('Saving to document ${documentId}');
      uri = _documentUri;
      method = 'POST';
    }

    return callApi(uri, toJson(), method: method);
  }

  // Deletes the document on the server.
  Future<Map> delete() {
    if (documentId == null) {
      _log.finest('Document not yet saved, not deleting.');
      return null;
    }
    return callApi(_documentUri, {}, method: 'DELETE');
  }

  // Logger.
  static final Logger _log = new Logger('UserDocument');

  // API endpoints.
  static final String _DOCUMENT_URI_BASE = '/api/v1/documents';
  // Returns the document get/post/delete URI.
  static String _getDocumentUri(String documentId) =>
      '${_DOCUMENT_URI_BASE}/${documentId}';
  // Returns the document get/post/delete URI.
  String get _documentUri => _getDocumentUri(documentId);
  // Scratch document URI.
  static final String _SCRATCH_DOCUMENT_URI = 'static/scratch.txt';
}
