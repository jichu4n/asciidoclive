/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global hljs */

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
  isSyncedScroll: false,
  editorLastScrollRatio: 0,
  previewLastScrollRatio: 0,

  i18n: Ember.inject.service(),
  settings: Ember.inject.service(),

  getContainer() {
    return this.$();
  },
  getEditorPane() {
    return this.$('.editor-pane');
  },
  getPreviewPane() {
    if (this.get('settings.showHtml')) {
      return this.$('.html-preview-pane');
    } else {
      return this.$('.preview-pane');
    }
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
  setupUi: Ember.on('didInsertElement', function() {
    Ember.run(this, function() {
      Ember.run.scheduleOnce('afterRender', this, function() {
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
        this.updatePreviewScrollState();
        this.onPreviewFontChanged();
        this.onPreviewFontSizeChanged();
        this.initialized = true;
      });
    });
  }),
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
    this.updatePreviewScrollState();
  },

  onEditorScroll: Ember.observer('editorScrollState.scrollTop', function() {
    if (this.get('settings.syncScroll') && !this.get('isSyncedScroll')) {
      this.set('isSyncedScroll', true);
      var editorScrollRatioDelta = this.get('editorScrollState.scrollRatio') -
        this.get('editorLastScrollRatio');
      this.get('previewScrollState').set(
        'scrollRatio',
        this.get('previewScrollState.scrollRatio') + editorScrollRatioDelta);
      this.getPreviewPane().scrollTop(this.get('previewScrollState.scrollTop'));
      this.set('isSyncedScroll', false);
    }
    this.set(
      'editorLastScrollRatio', this.get('editorScrollState.scrollRatio'));
  }),
  onPreviewChanged: Ember.on('didRender', function() {
    var scrollState = this.get('previewScrollState');
    var shouldScrollToBottom =
      scrollState.get('isAtBottom') && !scrollState.get('isAtTop');
    this.set('isSyncedScroll', true);
    this.updatePreviewScrollState();
    if (shouldScrollToBottom) {
      scrollState.set('scrollTop', scrollState.get('maxScrollTop'));
      this.getPreviewPane().scrollTop(scrollState.get('scrollTop'));
    }
    this.set('isSyncedScroll', false);
    if (!this.get('settings.showHtml')) {
      this.getPreviewPane().find('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    }
  }),
  updatePreviewScrollState() {
    var scrollState = this.get('previewScrollState');
    var previewPane = this.getPreviewPane();
    scrollState.set('viewportHeight', previewPane.innerHeight());
    scrollState.set('contentHeight', previewPane.prop('scrollHeight'));
    scrollState.set('scrollTop', previewPane.scrollTop() || 0);
  },
  onPreviewScroll: Ember.observer('previewScrollState.scrollTop', function() {
      if (this.get('settings.syncScroll') && !this.get('isSyncedScroll')) {
        this.set('isSyncedScroll', true);
        var previewScrollRatioDelta = this.get('previewScrollState.scrollRatio') -
          this.get('previewLastScrollRatio');
        this.get('editorScrollState').set(
          'scrollRatio',
          this.get('editorScrollState.scrollRatio') + previewScrollRatioDelta);
        this.set('isSyncedScroll', false);
      }
      this.set(
        'previewLastScrollRatio', this.get('previewScrollState.scrollRatio'));
    }),

  onPreviewFontChanged: Ember.observer(
    'settings.previewFont', function() {
      this.getPreviewPane()
        .css('font-family', this.get('settings.previewFont'));
    }),

  onPreviewFontSizeChanged: Ember.observer(
    'settings.previewFontSize', function() {
      var fontSizePercentage =
        this.get('settings.previewFontSize') /
        this.get('settings.previewFontSizeBase') * 100;
      this.getPreviewPane().css('font-size', fontSizePercentage + '%');
    })
});
