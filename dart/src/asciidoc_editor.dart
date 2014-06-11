/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 AsciiDoc editor.
*/

import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'package:crypto/crypto.dart';
import 'package:utf/utf.dart';

// AsciiDoc editor client-side implementation.
class AsciiDocEditor {

  // Constructor.
  AsciiDocEditor() {
    // Save demo source text.
    final DivElement sourceNode = querySelector('#${_SOURCE_NODE_ID}');
    _demoSourceText = sourceNode.text.trim();

    // Initialize editor.
    _aceEditor = context['ace'].callMethod(
        'edit', [_SOURCE_NODE_ID]);
    _aceEditorSession = _aceEditor.callMethod('getSession');
    // _aceEditor.callMethod('setTheme', ['ace/theme/monokai']);
    _aceEditorSession.callMethod(
        'setMode', ['ace/mode/asciidoc']);
    _aceEditorSession.callMethod(
        'setUseWrapMode', [true]);
    _aceEditorSession.callMethod(
        'setWrapLimitRange', [80, 80]);
    // Register event handler for source text.
    _aceEditorSession.callMethod(
        'on', ['change', _onSourceTextChange]);

    // Construct node validator for output HTML.
    NodeValidatorBuilder builder = new NodeValidatorBuilder.common();
    builder.allowNavigation(new _AllowAllUriPolicy());
    builder.allowImages(new _AllowAllUriPolicy());
    _outputNodeValidator = builder;

    // Start request timer.
    _Update();

    // Set up events.
    window.onBeforeUnload.listen(_onBeforeUnload);
  }

  // Returns the SHA1 digest of a string.
  String _getSha1Digest(String text) {
    SHA1 sha1 = new SHA1();
    sha1.add(encodeUtf8(text));
    return CryptoUtils.bytesToHex(sha1.close());
  }

  // Sends a POST request. This is similar to HttpRequest.postFormData(), except
  // it returns the raw HttpRequest object after the send.
  HttpRequest _postData(
      String url,
      Map<String, String> args,
      void onLoad(HttpRequest request),
      {void onError(HttpRequest request, ProgressEvent e)}) {
    List<String> arg_strings = [];
    args.forEach((k, v) {
      arg_strings.add(
          Uri.encodeQueryComponent(k) + '=' + Uri.encodeQueryComponent(v));
    });
    final String data = arg_strings.join('&');

    HttpRequest httpRequest = new HttpRequest();
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader(
        'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    httpRequest.onLoad.listen((ProgressEvent e) {
      // Note: file:// URIs have status of 0.
      if ((httpRequest.status >= 200 && httpRequest.status < 300) ||
          httpRequest.status == 0 || httpRequest.status == 304) {
        onLoad(httpRequest);
      } else {
        if (onError == null) {
          print('HttpRequest error: ${e.toString()}');
        } else {
          onError(httpRequest, e);
        }
      }
    });
    httpRequest.send(data);

    return httpRequest;
  }

  // Event handler for source text change.
  void _onSourceTextChange(JsObject e, JsObject t) {
    _updateTimer.cancel();
    _updateTimer = new Timer(_UPDATE_DELAY, _Update);
  }

  // Updates the UI given a server response.
  void _UpdateUi(Map response) {
    _outputNode.setInnerHtml(response['html'], validator: _outputNodeValidator);
  }

  // Callback that is invoked when HTML output is received from the server.
  void _onServerResponseReceived(String sourceTextDigest, HttpRequest request) {
    print('Got response for ${sourceTextDigest}');
    Map response = JSON.decode(request.responseText);
    _responseCache[sourceTextDigest] = response;
    _UpdateUi(response);
  }

  // Updates the output for the source text.
  void _Update() {
    String sourceText = _aceEditor.callMethod('getValue');
    if (sourceText.length > _MAX_SOURCE_TEXT_SIZE) {
      print('Warning: source text too large, truncating.');
      sourceText = sourceText.substring(0, _MAX_SOURCE_TEXT_SIZE);
    }
    if (sourceText == _sourceTextAtLastUpdate) {
      return;
    }
    final String sourceTextDigest = _getSha1Digest(sourceText);

    if (_responseCache.containsKey(sourceTextDigest)) {
      print('Using cached response for ${sourceTextDigest}');
      _UpdateUi(_responseCache[sourceTextDigest]);
    } else {
      print('Send request for ${sourceTextDigest}');
      if (_httpRequest != null) {
        _httpRequest.abort();
      }
      _httpRequest = _postData(
          _ASCIIDOC_TO_HTML_URI, {
              'text': sourceText,
          }, (HttpRequest request) =>
              _onServerResponseReceived(sourceTextDigest, request));
    }

    _sourceTextAtLastUpdate = sourceText;
    _updateTimer = new Timer(_UPDATE_INTERVAL, _Update);
  }

  // Callback invoked when the user attempts to close the window.
  void _onBeforeUnload(BeforeUnloadEvent e) {
    final String sourceText = _aceEditor.callMethod('getValue');
    if (sourceText.trim() == _demoSourceText) {
      return;
    }

    e.returnValue = (
        'If you leave this page, all data you have entered on this page '
        'will be lost. Please make sure to save any data you would like '
        'to keep by copying it from this page and saving it on your '
        'computer.');
  }

  // URL of the AsciiDoc API.
  static final String _ASCIIDOC_TO_HTML_URI = '/api/v1/asciidoc-to-html';

  // The amount of time to wait between two subsequent output updates.
  static const Duration _UPDATE_INTERVAL = const Duration(milliseconds: 3000);
  // The amount of time to wait before updating after a source text change.
  static const Duration _UPDATE_DELAY = const Duration(milliseconds: 600);

  // The maximum source text size supported, in bytes.
  static const int _MAX_SOURCE_TEXT_SIZE = 32 * 1024;

  // Client-side cache. Maps SHA1 checksum of source text to server response.
  static Map<String, Map> _responseCache = new Map<String, Map>();

  // DOM components.
  final String _SOURCE_NODE_ID = 'asciidoc-source';
  final DivElement _outputNode = querySelector('#asciidoc-output');

  // Handle to Ace editor object.
  JsObject _aceEditor = null;
  // Ace editor session.
  JsObject _aceEditorSession = null;

  // Node validator for output HTML.
  NodeValidator _outputNodeValidator = null;

  // The current outstanding HTTP request.
  HttpRequest _httpRequest = null;
  // The source text retrieved during the previous update.
  String _sourceTextAtLastUpdate = null;
  // The original demo text.
  String _demoSourceText = null;

  // Timer for executing _Update.
  Timer _updateTimer = null;
}


// A simple UriPolicy that allows all URLs.
class _AllowAllUriPolicy implements UriPolicy {
  @override
  bool allowsUri(String uri) => true;
}


void main() {
  AsciiDocEditor editor = new AsciiDocEditor();
}
