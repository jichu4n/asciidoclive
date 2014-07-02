/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor view.
*/

import 'dart:async';
import 'dart:html';
import 'dart:js';
import 'dart:math';
import 'package:logging/logging.dart';
import 'lib/compiler.dart';
import 'lib/utils.dart';


// The state of an editor view.
class _EditorViewContext {

  // DOM components.
  static final String SOURCE_NODE_ID = 'g-source';
  final DivElement sourceNode = querySelector('#${SOURCE_NODE_ID}');
  final DivElement sourceContainerNode = querySelector('#g-source-container');
  final DivElement outputNode = querySelector('#g-output');
  final DivElement outputContainerNode = querySelector('#g-output-container');

  // Handle to Ace editor object.
  JsObject aceEditor = null;
  // Ace editor session.
  JsObject aceEditorSession = null;
}


// Editor view controller.
class EditorView {

  // Constructor. Initializes the view.
  EditorView() {
    // Initialize Ace editor.
    _context.aceEditor = context['ace'].callMethod(
        'edit', [_EditorViewContext.SOURCE_NODE_ID]);
    // For manual debugging in the console.
    context['aceEditor'] = _context.aceEditor;
    _context.aceEditorSession = _context.aceEditor.callMethod('getSession');
    // _context.aceEditor.callMethod('setTheme', ['ace/theme/monokai']);
    _context.aceEditorSession.callMethod(
        'setMode', ['ace/mode/asciidoc']);
    _context.aceEditorSession.callMethod(
        'setUseWrapMode', [true]);
    _context.aceEditorSession.callMethod(
        'setWrapLimitRange', [80, 80]);
    // Register event handler for source text.
    _context.aceEditorSession.callMethod(
        'on', ['change', _onSourceTextChange]);
    // Set focus on editor now.
    _context.aceEditor.callMethod('focus');
    // Now we can remove the unitialized class from source node to unhide the
    // text.
    _context.sourceNode.classes.remove('uninitialized');

    // Sync scrolling.
    _scrollSyncer = new _EditorViewScrollSyncer(_context);

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

    _context.outputNode.setInnerHtml(response['html'], validator: _outputNodeValidator);
  }

  // Returns the source text in the editor.
  String get sourceText => _context.aceEditor.callMethod('getValue').trim();

  // Event handler for source text change.
  void _onSourceTextChange(JsObject e, JsObject t) {
    _updateTimer.cancel();
    _updateTimer = new Timer(_UPDATE_DELAY, _update);
  }

  // Logger.
  final Logger _log = new Logger('EditorView');

  // Common editor view context.
  final _EditorViewContext _context = new _EditorViewContext();

  // Scroll syncer.
  _EditorViewScrollSyncer _scrollSyncer;

  // Document compiler.
  final Compiler _compiler = new Compiler();

  // Node validator for output HTML.
  NodeValidator _outputNodeValidator = null;

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


// Synchronizes the scroll position of the source editor and output views.
class _EditorViewScrollSyncer {

  // Constructor.
  _EditorViewScrollSyncer(_EditorViewContext context) {
    _context = context;

    _context.aceEditorSession.callMethod(
        'on', ['changeScrollTop', _onSourceTextScroll]);
    _context.outputNode.onScroll.listen(_onOutputScroll);
  }

  // Returns the scroll size of the source.
  _ScrollSize get _sourceScrollSize {
    final num sourceContentHeight =
        _context.aceEditorSession
            .callMethod('getDocument').callMethod('getLength') *
        _context.aceEditor['renderer']['lineHeight'];
    return new _ScrollSize(
        _context.sourceNode.clientHeight, sourceContentHeight);
  }
  // Returns the scroll size of the output.
  _ScrollSize get _outputScrollSize
      => new _ScrollSize(
          _context.outputNode.clientHeight, _context.outputNode.scrollHeight);

  // Returns the scroll position of the source.
  num get _sourceScrollRatio
      => _sourceScrollSize.toScrollRatio(
             _context.aceEditorSession.callMethod('getScrollTop'));

  // Returns the scroll position of the output.
  num get _outputScrollRatio
      => _outputScrollSize.toScrollRatio(_context.outputNode.scrollTop);

  // Sets the scroll position of the source.
  void _setSourceScrollRatio(num scrollRatio) {
    _context.aceEditorSession.callMethod(
        'setScrollTop', [_sourceScrollSize.toScrollTop(scrollRatio)]);
  }

  // Sets the scroll position of the output.
  void _setOutputScrollRatio(num scrollRatio) {
    // scrollTop takes an int.
    _context.outputNode.scrollTop =
        _outputScrollSize.toScrollTop(scrollRatio).round();
  }

  // Callback invoked when the source text is scrolled.
  void _onSourceTextScroll(num position, JsObject t) {
    if (_scrollEventSource == null) {
      _scrollEventSource = _context.sourceNode;
      _setOutputScrollRatio(_sourceScrollRatio);
      _scrollEventSource = null;
    }
  }

  // Callback invoked when the output text is scrolled.
  void _onOutputScroll(Event e) {
    if (_scrollEventSource == null) {
      _scrollEventSource = _context.outputNode;
      _setSourceScrollRatio(_outputScrollRatio);
      _scrollEventSource = null;
    }
  }

  // Editor context.
  _EditorViewContext _context;

  // Set when the source or the output is being scrolled by the user. This
  // prevents scrolling callbacks on other elements.
  Element _scrollEventSource = null;
}


void main() {
  setUpLogging();
  final EditorView editorView = new EditorView();
}
