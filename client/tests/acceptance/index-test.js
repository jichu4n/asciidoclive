/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import { test } from 'qunit';
import moduleForAcceptance from 'amoya/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | index');

test('visiting /', function(assert) {
  var done = assert.async();
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/edit/scratch/1');
    setTimeout(done, 30000);
  });
});
