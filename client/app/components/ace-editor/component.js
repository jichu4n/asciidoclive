/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global ace */

import Ember from 'ember';

export default Ember.Component.extend({
  // To be injected.
  width: null,
  height: null,
  classNames: ['ace-editor'],

  editor: null,
  didInsertElement() {
    this.set('editor', ace.edit(this.$()[0]));
    this.$().css('width', this.get('width') + 'px');
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
  })
});
