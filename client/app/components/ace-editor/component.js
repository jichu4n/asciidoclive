/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global ace */

import Ember from 'ember';

export default Ember.Component.extend({
  // To be injected.
  doc: null,
  width: null,
  height: null,
  classNames: ['ace-editor'],

  debounceState: {
    debounceMs: 150,
    lastUpdateTs: new Date(),
    nextUpdate: null,
  },

  editor: null,
  session: null,
  didInsertElement() {
    Ember.run.next(this, function() {
      this.$().css('width', this.get('width') + 'px');

      this.set('editor', ace.edit(this.$()[0]));
      this.set('session', this.get('editor').getSession());
      this.get('session').setValue(this.get('doc.body') || '');
      this.get('session').on('change', this.debouncedUpdate.bind(this));
      this.get('session').setMode('ace/mode/asciidoc');
      this.get('session').setUseWrapMode(true);
      this.get('editor').setShowPrintMargin(false);
    });
  },
  updateWidth: Ember.observer('width', 'height', function() {
    Ember.run.once(this, function() {
      this.$().css('width', this.get('width') + 'px');
      this.$().css('height', this.get('height') + 'px');
      if (Ember.isNone(this.get('editor'))) {
        return;
      }
      this.get('editor').resize();
    });
  }),
  onDocBodyChange: Ember.observer('doc.body', function() {
    if (Ember.isNone(this.get('editor'))) {
      return;
    }
    var body = (this.get('doc.body') || '').toString();
    if (this.get('doc.body') !== this.get('session').getValue()) {
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
      debounceState.nextUpdate = Ember.run.next(this, this.update));
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
  }
});
