/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Scroll position synchronization.
*/

part of editor_view;

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
