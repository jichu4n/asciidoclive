/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';

export default Ember.Route.extend({
  docManager: Ember.inject.service(),

  titleToken() {
    return this.get('docManager.doc.title');
  },
  title(tokens) {
    console.info('Tokens: %o', tokens);
    return tokens[0] + ' - AsciiDocLIVE';
  },
  updateTitle: Ember.observer('docManager.doc.title', function() {
    console.info('Updating title');
    this.send('collectTitleTokens', []);
  })
});
