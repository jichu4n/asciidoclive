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
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:utf/utf.dart';

// AsciiDoc editor client-side implementation.
class AsciiDocEditor {

  // Constructor.
  AsciiDocEditor() {
    // Save demo source text.
    _sourceNode = querySelector('#${_SOURCE_NODE_ID}');
    _demoSourceText = _sourceNode.text.trim();

    // Initialize editor.
    _aceEditor = context['ace'].callMethod(
        'edit', [_SOURCE_NODE_ID]);
    // For manual debugging in the console.
    context['aceEditor'] = _aceEditor;
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
    _aceEditorSession.callMethod(
        'on', ['changeScrollTop', _onSourceTextScroll]);
    // Set focus on editor now.
    _aceEditor.callMethod('focus');
    // Register event handler for output.
    _outputNode.onScroll.listen(_onOutputScroll);

    // Construct node validator for output HTML.
    NodeValidatorBuilder builder = new NodeValidatorBuilder.common();
    builder.allowNavigation(new _AllowAllUriPolicy());
    builder.allowImages(new _AllowAllUriPolicy());
    _outputNodeValidator = builder;

    // Start request timer.
    _update();

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
    _updateTimer = new Timer(_UPDATE_DELAY, _update);
  }

  // Utility function for creating a message element to be displayed. type
  // should be one of 'success', 'warning' and 'error'.
  Element _newMessageNode(String type, String message, [int lineNumber]) {
    assert(_MESSAGE_TYPE_TO_ICON.containsKey(type));
    print('Message: ${type}: ${message}');

    DivElement messageNode = _messageTemplateNode.clone(true);
    messageNode.id = '';
    messageNode.classes.remove('hidden');
    messageNode.classes.addAll(['message', 'message-${type}']);

    Element messageTextNode = messageNode.querySelector('.text');
    SpanElement iconNode = new SpanElement();
    iconNode.classes.addAll(['fa', 'icon']);
    iconNode.classes.addAll(_MESSAGE_TYPE_TO_ICON[type]);
    messageTextNode.children.add(iconNode);
    messageTextNode.appendText(message);

    if (lineNumber != null) {
      messageNode.classes.add('message-with-line-number');
      messageNode.title = _lineNumberMessageTitleText;
      messageNode.onClick.listen((MouseEvent e) =>
          _aceEditor.callMethod('gotoLine', [lineNumber, 1, true]));
    }

    return messageNode;
  }

  // Updates the messages container with the provided list of message elements.
  void _showMessages(List<Element> messageNodes) {
    _messagesNode.children.clear();
    _messagesNode.children.addAll(messageNodes);
    final num messagesHeight = _messagesNode.clientHeight;
    _outputContainerNode.style.paddingBottom = '${messagesHeight}px';
  }

  // Updates the UI given a server response.
  void _updateUi(Map response) {

    _outputNode.setInnerHtml(response['html'], validator: _outputNodeValidator);

    List<Element> messageNodes = [];
    if (response['error_message'].isEmpty) {
      if (response['success']) {
        messageNodes.add(_newMessageNode('success', _successMessageText));
      } else {
        messageNodes.add(_newMessageNode('error', _errorMessageText));
      }
    } else {
      response['error_message'].split('\n').forEach((String line) {
        String messageText = line.replaceAllMapped(
            _ERROR_MESSAGE_RE, (Match m) => m[1]);
        if (messageText.isNotEmpty) {
          int messageLineNumber = null;
          try {
            messageLineNumber = int.parse(messageText.replaceAllMapped(
                _ERROR_MESSAGE_LINE_NUMBER_RE, (Match m) => m[1]));
          } on FormatException catch (e) {
            print('Could not parse line number from message: ${e.toString()}');
          }
          // Capitalize first character.
          messageText = messageText.substring(0, 1).toUpperCase() +
              messageText.substring(1);

          messageNodes.add(
              _newMessageNode('warning', messageText, messageLineNumber));
        }
      });
    }
    _showMessages(messageNodes);
  }

  // Callback that is invoked when HTML output is received from the server.
  void _onServerResponseReceived(String sourceTextDigest, HttpRequest request) {
    print('Got response for ${sourceTextDigest}');
    Map response = JSON.decode(request.responseText);
    _responseCache[sourceTextDigest] = response;
    _updateUi(response);
  }

  // Updates the output for the source text.
  void _update() {
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
      _updateUi(_responseCache[sourceTextDigest]);
    } else {
      print('Send request for ${sourceTextDigest}');
      _showMessages([_newMessageNode('loading', _loadingMessageText)]);
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
    _updateTimer = new Timer(_UPDATE_INTERVAL, _update);
  }

  // Callback invoked when the user attempts to close the window.
  void _onBeforeUnload(BeforeUnloadEvent e) {
    final String sourceText = _aceEditor.callMethod('getValue');
    if (sourceText.trim() == _demoSourceText) {
      return;
    }

    e.returnValue = _unloadConfirmationMessage;
  }

  // Returns the scroll size of the source.
  _ScrollSize get _sourceScrollSize {
    final num sourceContentHeight =
        _aceEditorSession.callMethod('getDocument').callMethod('getLength') *
        _aceEditor['renderer']['lineHeight'];
    return new _ScrollSize(_sourceNode.clientHeight, sourceContentHeight);
  }
  // Returns the scroll size of the output.
  _ScrollSize get _outputScrollSize
      => new _ScrollSize(_outputNode.clientHeight, _outputNode.scrollHeight);

  // Returns the scroll position of the source.
  num get _sourceScrollRatio
      => _sourceScrollSize.toScrollRatio(
             _aceEditorSession.callMethod('getScrollTop'));

  // Returns the scroll position of the output.
  num get _outputScrollRatio
      => _outputScrollSize.toScrollRatio(_outputNode.scrollTop);

  // Sets the scroll position of the source.
  void _setSourceScrollRatio(num scrollRatio) {
    _aceEditorSession.callMethod(
        'setScrollTop', [_sourceScrollSize.toScrollTop(scrollRatio)]);
  }

  // Sets the scroll position of the output.
  void _setOutputScrollRatio(num scrollRatio) {
    _outputNode.scrollTop = _outputScrollSize.toScrollTop(scrollRatio);
  }

  // Callback invoked when the source text is scrolled.
  void _onSourceTextScroll(JsObject e, JsObject t) {
    if (_scrollEventSource == null) {
      _scrollEventSource = _sourceNode;
      _setOutputScrollRatio(_sourceScrollRatio);
      _scrollEventSource = null;
    }
  }

  // Callback invoked when the output text is scrolled.
  void _onOutputScroll(Event e) {
    if (_scrollEventSource == null) {
      _scrollEventSource = _outputNode;
      _setSourceScrollRatio(_outputScrollRatio);
      _scrollEventSource = null;
    }
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
  DivElement _sourceNode = null;
  final DivElement _outputNode = querySelector('#asciidoc-output');
  final DivElement _outputContainerNode =
      querySelector('#asciidoc-output-container');
  final DivElement _messagesNode = querySelector('#asciidoc-messages');
  final DivElement _messageTemplateNode =
      querySelector('#asciidoc-message-template');
  final String _unloadConfirmationMessage = (
      querySelector('#unload-confirmation-message').text
      .replaceAllMapped(
          new RegExp(r'([^\n])\n([^\n])', multiLine: true),
          (Match m) => '${m[1]} ${m[2]}')
      .replaceAll(new RegExp(r'[ ]+'), ' '));
  final String _successMessageText =
      querySelector('#asciidoc-success-message-text').text.trim();
  final String _errorMessageText =
      querySelector('#asciidoc-error-message-text').text.trim();
  final String _loadingMessageText =
      querySelector('#asciidoc-loading-message-text').text.trim();
  final String _lineNumberMessageTitleText =
      querySelector('#asciidoc-line-number-message-title-text').text.trim();
  // Maps a message type to a Font Awesome icon names.
  static final Map<String, List<String>> _MESSAGE_TYPE_TO_ICON = {
      'success': ['fa-check'],
      'warning': ['fa-exclamation-triangle'],
      'error': ['fa-times-circle'],
      'loading': ['fa-refresh', 'fa-spin'],
  };
  // Regular expression for extracting message to be displayed from a raw error
  // message.
  static final RegExp _ERROR_MESSAGE_RE =
      new RegExp(r'^(?:[^:]+:\s+){3}(.*)$');
  // Regular expression for extracting the line number from an error message.
  static final RegExp _ERROR_MESSAGE_LINE_NUMBER_RE =
      new RegExp(r'^line\s+(\d+):.*$');

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

  // Timer for executing _update.
  Timer _updateTimer = null;

  // Set when the source or the output is being scrolled by the user. This
  // prevents scrolling callbacks on other elements.
  DivElement _scrollEventSource = null;
}


// A simple UriPolicy that allows all URLs.
class _AllowAllUriPolicy implements UriPolicy {
  @override
  bool allowsUri(String uri) => true;
}

// A struct holding data used for scroll ratio/position computation for an
// element.
class _ScrollSize {
  // Height of the viewport, i.e., the visible portion of the element.
  num viewportHeight;
  // Height of the content in the element, i.e. the scrollHeight.
  num contentHeight;

  // The maximum possible scrollTop value for this element.
  num get maxScrollTop => max(0, contentHeight - viewportHeight);
  // Converts a scrollTop value to a scroll position ratio (between 0 and 1).
  num toScrollRatio(num scrollTop) =>
      maxScrollTop > 0 ?
      scrollTop / maxScrollTop :
      1.0;
  // Converts a scroll position ration to a concrete scrollTop value.
  num toScrollTop(num scrollRatio) => scrollRatio * maxScrollTop;

  // Constructor.
  _ScrollSize(this.viewportHeight, this.contentHeight);
}


void main() {
  AsciiDocEditor editor = new AsciiDocEditor();
}
