/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import ResizeAware from 'ember-resize/mixins/resize-aware';
import ScrollState from '../../utils/scroll-state';

export default Ember.Component.extend(ResizeAware, {
  // To be injected.
  doc: null,

  classNames: ['pane-layout'],
  minPaneWidth: 200,

  editorPaneWidth: null,
  editorScrollState: null,
  previewScrollState: ScrollState.create(),

  i18n: Ember.inject.service(),

  getContainer() {
    return this.$();
  },
  getEditorPane() {
    return this.$('.editor-pane');
  },
  getPreviewPane() {
    return this.$('.preview-pane');
  },
  getResizeHandle() {
    return this.$('.resize-handle');
  },
  getMaxPaneWidth() {
    return this.getContainer().width() -
      this.get('minPaneWidth') -
      this.getResizeHandle().width();
  },
  updateEditorPaneSize() {
    var editorPane = this.getEditorPane();
    this.set('editorPaneWidth', editorPane.width());
    this.set('editorPaneHeight', editorPane.height());
  },

  initialized: false,
  didInsertElement() {
    this._super();
    Ember.run.next(this, function() {
      this.getEditorPane().resizable({
        handles: {
          e: this.getResizeHandle()
        },
        minWidth: this.get('minPaneWidth'),
        maxWidth: this.getMaxPaneWidth(),
        resize: this.updateEditorPaneSize.bind(this)
      });
      this.updateEditorPaneSize();
      this.getPreviewPane().scroll(function() {
        Ember.run.once(this, this.updatePreviewScrollState);
      }.bind(this));
      this.initialized = true;
    });
  },
  debouncedDidResize() {
    if (!this.get('initialized')) {
      return;
    }
    var maxPaneWidth = this.getMaxPaneWidth();
    var editorPane = this.getEditorPane();
    editorPane.resizable('option', 'maxWidth', maxPaneWidth);
    if (editorPane.width() > maxPaneWidth) {
      editorPane.width(maxPaneWidth);
    }
    this.updateEditorPaneSize();
  },

  debounceEditorScroll: Ember.observer(
    'editorScrollState.scrollRatio', function() {
      Ember.run.once(this, this.onEditorScroll);
    }),
  onEditorScroll() {
    console.info(
      'Editor scroll ratio: %f', this.get('editorScrollState.scrollRatio'));
  },
  updatePreviewScrollState() {
    var scrollState = this.get('previewScrollState');
    var previewPane = this.getPreviewPane();
    scrollState.set('viewportHeight', previewPane.innerHeight());
    scrollState.set('contentHeight', previewPane.prop('scrollHeight'));
    scrollState.set('scrollTop', previewPane.scrollTop());
  },
  debouncePreviewScroll: Ember.observer(
    'previewScrollState.scrollRatio', function() {
      console.info('Updated preview scroll state');
      Ember.run.once(this, this.onPreviewScroll);
    }),
  onPreviewScroll() {
    console.info(
      'Preview scroll ratio: %f', this.get('previewScrollState.scrollRatio'));
  }
});
