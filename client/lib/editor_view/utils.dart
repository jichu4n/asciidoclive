/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Common classes and definitions for the editor view.
*/

part of editor_view;

// Common state of an editor view.
class _EditorViewContext {

  // DOM components.
  static final String SOURCE_NODE_ID = 'g-source';
  final DivElement sourceNode = querySelector('#${SOURCE_NODE_ID}');
  final DivElement sourceContainerNode = querySelector('#g-source-container');
  final DivElement outputNode = querySelector('#g-output');
  final DivElement outputContainerNode = querySelector('#g-output-container');
  final DivElement messagesNode = querySelector('#g-messages');

  // Handle to Ace editor object.
  JsObject aceEditor = null;
  // Ace editor session.
  JsObject aceEditorSession = null;
}

// Model of a message displayed in the editor.
class _EditorMessage {
  // Message types.
  static final String SUCCESS = 'success';
  static final String PROGRESS = 'progress';
  static final String WARNING = 'warning';
  static final String ERROR = 'error';
  static final List<String> MESSAGE_TYPES = [
      SUCCESS,
      PROGRESS,
      WARNING,
      ERROR,
  ];

  // The message type.
  String type;
  // The message text.
  String text;
  // The line number (optional).
  int lineNumber = null;

  @override
  String toString() {
    if (lineNumber == null) {
      return '${type.toUpperCase()}: ${text}';
    } else {
      return '${type.toUpperCase()}: [${lineNumber}] ${text}';
    }
  }
}
