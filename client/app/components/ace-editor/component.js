/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global ace */

import Ember from 'ember';
import ScrollState from '../../utils/scroll-state';

export default Ember.Component.extend({
  // To be injected.
  doc: null,
  width: null,
  height: null,
  classNames: ['ace-editor'],
  scrollState: null,

  settings: Ember.inject.service(),

  editor: null,
  session: null,
  debounceState: {
    debounceMs: 100,
    lastUpdateTs: new Date(),
    nextUpdate: null,
  },

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.$().css('width', this.get('width') + 'px');

      this.set('editor', ace.edit(this.$()[0]));
      this.set('session', this.get('editor').getSession());
      this.get('session').setValue(this.get('doc.body').toString() || '');
      this.get('session').on('change', this.debouncedUpdate.bind(this));
      this.get('session').setMode('ace/mode/asciidoc');
      this.get('session').setUseWrapMode(true);
      this.get('editor').setShowPrintMargin(false);
      this.get('session').on('change', this.onScroll.bind(this));
      this.get('session').on('changeScrollTop', this.onScroll.bind(this));
      this.onScroll();
      this.onThemeChanged();
      this.onEditorFontSizeChanged();
    });
  },
  updateSize: Ember.observer('width', 'height', function() {
    Ember.run.once(this, function() {
      this.$().css('width', this.get('width') + 'px');
      this.$().css('height', this.get('height') + 'px');
      if (Ember.isNone(this.get('editor'))) {
        return;
      }
      this.get('editor').resize();
      this.onScroll();
    });
  }),
  onDocBodyChange: Ember.observer('doc.body', function() {
    if (Ember.isNone(this.get('editor'))) {
      return;
    }
    var body = (this.get('doc.body').toString() || '').toString();
    if (body !== this.get('session').getValue()) {
      this.get('session').setValue(body);
    }
  }),
  debouncedUpdate() {
    var debounceState = this.get('debounceState');
    if (!Ember.isNone(debounceState.nextUpdate)) {
      return;
    }
    var now = new Date();
    var timeSinceLastUpdate = now - debounceState.lastUpdateTs;
    if (timeSinceLastUpdate > debounceState.debounceMs) {
      debounceState.nextUpdate = Ember.run.next(this, this.update);
    } else {
      debounceState.nextUpdate = Ember.run.later(
        this, this.update, debounceState.debounceMs - timeSinceLastUpdate);
    }
  },
  update() {
    var debounceState = this.get('debounceState');
    debounceState.lastUpdateTs = new Date();
    debounceState.nextUpdate = null;
    this.get('doc').set('body', this.get('session').getValue());
  },
  onScroll() {
    var scrollState = this.get('scrollState');
    if (Ember.isNone(scrollState)) {
      this.set('scrollState', scrollState = ScrollState.create());
    }
    scrollState.set('viewportHeight', this.get('height'));
    scrollState.set(
      'contentHeight',
      this.get('session').getScreenLength() *
        this.get('editor').renderer.lineHeight);
    scrollState.set('scrollTop', this.get('session').getScrollTop() || 0);
  },
  onScrollTopChanged: Ember.observer('scrollState.scrollTop', function() {
    this.get('session').setScrollTop(this.get('scrollState.scrollTop'));
  }),

  onThemeChanged: Ember.observer('settings.editorTheme', function() {
    if (Ember.isNone(this.get('editor'))) {
      return;
    }
    var theme = this.get('settings.editorTheme');
    this.get('editor').setTheme(
      Ember.isNone(theme) ?
        undefined :
        ('ace/theme/' + theme));
  }),

  onEditorFontSizeChanged: Ember.observer(
    'settings.editorFontSize', function() {
      if (Ember.isNone(this.get('editor'))) {
        return;
      }
      this.get('editor').setFontSize(this.get('settings.editorFontSize'));
    })
});
