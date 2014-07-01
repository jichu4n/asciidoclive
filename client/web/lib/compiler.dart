/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Document compilation and client-side caching.
*/
library compilation;

import 'dart:async';
import 'dart:collection';
import 'dart:html';
import 'package:crypto/crypto.dart';
import 'package:logging/logging.dart';
import 'package:utf/utf.dart';
import 'utils.dart';


// Interface for compiling documents.
//
// Server responses are cached on the client side.
class Compiler {

  // Compiles a document, and returns a future that yields the server response.
  //
  // If the text results in a cache miss and an outstanding compilation request
  // exists, it is aborted and its associated future is completed with null.
  Future<Map> compile(String text) {
    Completer completer = new Completer();
    final String textDigest = _getSha1Digest(text);
    if (_responseCache.containsKey(textDigest)) {
      _log.finest('Using cached response for ${textDigest}');
      completer.complete(_responseCache[textDigest]);
      // Move this key to the end of the queue.
      _responseCacheKeys.remove(textDigest);
      _responseCacheKeys.add(textDigest);
    } else {
      _log.finest('Send request for ${textDigest}');
      if (_httpRequest != null) {
        _httpRequest.abort();
      }
      _httpRequest = new HttpRequest();
      _httpRequest.onAbort.listen((_) => completer.complete(null));
      callApi(
          _ASCIIDOC_TO_HTML_URI,
          {'text': text},
          request: _httpRequest)
          .then((Map response) => _onResponse(completer, textDigest, response))
          .catchError((e) => completer.completeError(e));
    }
    return completer.future;
  }

  // Callback invoked upon a successful request.
  void _onResponse(Completer completer, String textDigest, Map response) {
    _log.finest('Received response for ${textDigest}');
    while (_responseCache.length >= _MAX_CACHE_SIZE) {
      assert(_responseCache.length == _responseCacheKeys.length);
      final String textDigestToRemove = _responseCacheKeys.removeFirst();
      _responseCache.remove(textDigestToRemove);
    }
    _responseCache[textDigest] = response;
    _responseCacheKeys.add(textDigest);
    completer.complete(response);
  }

  // Returns the SHA1 digest of a string.
  String _getSha1Digest(String text) {
    SHA1 sha1 = new SHA1();
    sha1.add(encodeUtf8(text));
    return CryptoUtils.bytesToHex(sha1.close());
  }

  // URL of the AsciiDoc API.
  static final String _ASCIIDOC_TO_HTML_URI = '/api/v1/asciidoc-to-html';
  // Max number of items to keep in the cache.
  static final int _MAX_CACHE_SIZE = 1000;

  // Logger instance.
  final Logger _log = new Logger('Compiler');
  // Client-side cache. Maps source text SHA1 digest to server response.
  final Map<String, Map> _responseCache = new Map<String, Map>();
  // Queue of source text SHA1 digests cached, in the order in which they were
  // last accessed.
  final Queue<String> _responseCacheKeys = new ListQueue<String>();
  // The current outstanding HTTP request.
  HttpRequest _httpRequest = null;
}
