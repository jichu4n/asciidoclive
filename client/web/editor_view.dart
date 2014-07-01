/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor view.
*/

import 'dart:async';
import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'dart:math';
import 'package:logging/logging.dart';
import 'lib/compiler.dart';
import 'lib/utils.dart';

// Editor view controller.
class EditorView {

  // Constructor. Initializes the view.
  EditorView() {
    // Initialize Ace editor.
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
    // Now we can remove the unitialized class from source node to unhide the
    // text.
    _sourceNode.classes.remove('uninitialized');

    // Construct node validator for output HTML.
    NodeValidatorBuilder builder = new NodeValidatorBuilder.common();
    builder.allowNavigation(new _AllowAllUriPolicy());
    builder.allowImages(new _AllowAllUriPolicy());
    _outputNodeValidator = builder;

    // Start request timer.
    _update();
  }

  // Updates the output given the current source text.
  void _update() {
    String sourceTextToCompile = sourceText;
    if (sourceTextToCompile.length > _MAX_SOURCE_TEXT_SIZE) {
      _log.warning(
          'Source text size exceeds maximum of ${_MAX_SOURCE_TEXT_SIZE}');
      sourceTextToCompile = sourceTextToCompile.substring(
          0, _MAX_SOURCE_TEXT_SIZE);
    }

    if (sourceTextToCompile != _sourceTextAtLastUpdate) {
      _sourceTextAtLastUpdate = sourceTextToCompile;
      _compiler.compile(sourceTextToCompile)
          .then(_updateUI)
          .catchError(_updateUI);
    }

    // Schedule this method to run again after _UPDATE_INTERVAL.
    _updateTimer = new Timer(_UPDATE_INTERVAL, _update);
  }

  // Updates the UI given a server response.
  void _updateUI(response) {
    if (response == null) {
      // Request was aborted.
      _log.finest('Update aborted');
      return;
    }
    if (!(response is Map)) {
      // Error.
      _log.finest('Error: ${response}');
      return;
    }

    assert(response is Map);

    _outputNode.setInnerHtml(response['html'], validator: _outputNodeValidator);
  }

  // Returns the source text in the editor.
  String get sourceText => _aceEditor.callMethod('getValue').trim();

  // Event handler for source text change.
  void _onSourceTextChange(JsObject e, JsObject t) {
    _updateTimer.cancel();
    _updateTimer = new Timer(_UPDATE_DELAY, _update);
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
    // scrollTop takes an int.
    _outputNode.scrollTop = _outputScrollSize.toScrollTop(scrollRatio).round();
  }

  // Callback invoked when the source text is scrolled.
  void _onSourceTextScroll(num position, JsObject t) {
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

  // Logger.
  final Logger _log = new Logger('EditorView');

  // Document compiler.
  final Compiler _compiler = new Compiler();

  // DOM components.
  static final String _SOURCE_NODE_ID = 'g-source';
  final DivElement _sourceNode = querySelector('#${_SOURCE_NODE_ID}');
  final DivElement _sourceContainerNode = querySelector('#g-source-container');
  final DivElement _outputNode = querySelector('#g-output');
  final DivElement _outputContainerNode = querySelector('#g-output-container');

  // Handle to Ace editor object.
  JsObject _aceEditor = null;
  // Ace editor session.
  JsObject _aceEditorSession = null;

  // Node validator for output HTML.
  NodeValidator _outputNodeValidator = null;

  // Set when the source or the output is being scrolled by the user. This
  // prevents scrolling callbacks on other elements.
  DivElement _scrollEventSource = null;

  // The maximum source text size supported, in bytes. This should match the
  // limit set on the server.
  static const int _MAX_SOURCE_TEXT_SIZE = 32 * 1024;

  // The amount of time to wait between two subsequent output updates.
  static const Duration _UPDATE_INTERVAL = const Duration(milliseconds: 3000);
  // The amount of time to wait before updating after a source text change.
  static const Duration _UPDATE_DELAY = const Duration(milliseconds: 600);
  // Timer for executing _update.
  Timer _updateTimer = null;

  // The source text retrieved during the previous update.
  String _sourceTextAtLastUpdate = null;
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
  setUpLogging();
  final EditorView editorView = new EditorView();
}
