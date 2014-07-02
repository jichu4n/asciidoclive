/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Common state of an editor view.
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

  // Handle to Ace editor object.
  JsObject aceEditor = null;
  // Ace editor session.
  JsObject aceEditorSession = null;
}
