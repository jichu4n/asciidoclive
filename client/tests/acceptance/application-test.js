import { test } from 'qunit';
import moduleForAcceptance from 'amoya/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | application');

test('visiting /_test', function(assert) {
  visit('/_test');

  andThen(function() {
    assert.equal(currentURL(), '/_test');
  });
});
