/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor view.
*/

library editor_view;

import 'dart:async';
import 'dart:collection';
import 'dart:html';
import 'dart:js';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:logging/logging.dart';
import 'package:utf/utf.dart';
import 'package:goby/utils.dart';

part 'compiler.dart';
part 'compiler_messages.dart';
part 'editor_view_context.dart';
part 'editor_view_scroll_syncer.dart';


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
