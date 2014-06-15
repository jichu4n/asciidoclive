# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""MongoEngine models."""

import os
import time

# Usually we don't import individual classes directly, but we'll make an
# exception here as this makes the model classes much more readable.
from lib.env_lib import DB


class CachedAsciiDocResult(DB.Document):
  """Cached results from an AsciiDoc run."""

  # Checksum of the input text that triggered the run.
  text_sha1_digest = DB.StringField(
      required=True,
      unique=True,
      min_length=40,
      max_length=40)
  # The return code of the AsciiDoc process.
  return_code = DB.IntField()
  # The output to STDOUT.
  stdout_output = DB.StringField()
  # The output to STDERR.
  stderr_output = DB.StringField()
  # Timestamp at which this run finished.
  run_ts = DB.IntField()
  # The number of seconds AsciiDoc took to complete.
  run_time = DB.FloatField()

  meta = {
      'collection': 'cached_asciidoc_results',
      'indexes': ['text_sha1_digest', 'run_ts'],
  }


class Account(DB.EmbeddedDocument):
  """A user account from a particular provider."""

  # The type of the account provider.
  account_provider_type = DB.StringField(
      required=True,
      choices=[
          'google',
          'facebook',
          'twitter',
          'linkedin',
      ])
  # The account provider's ID for the user.
  user_id = DB.StringField(required=True)
  # The full account ID string. This is of the form
  #    <account_provider_type>::<user_id>
  account_id = DB.StringField(required=True, unique=True)

  # Data about this user from the account provider.
  data = DB.DictField()

  @staticmethod
  def ToAccountId(account_provider_type, user_id):
    """Generates a full account ID from the provider type and user ID.

    The generated account ID is of the form
        <account_provider_type>::<user_id>

    Args:
      account_provider_type: the type of the account provider.
      user_id: the account provider's ID for the user.
    Returns:
      The generated account ID.
    """
    return '%s::%s' % (account_provider_type, user_id)


class User(DB.Document):
  """A user in our system.

  A single user may be logged in to accounts from multiple account providers;
  for example, a user may be simultaneously logged in to Facebook and Google.
  """

  # Our very own user ID :)
  user_id = DB.StringField(required=True, unique=True)

  # Accounts from account providers.
  accounts = DB.ListField(DB.EmbeddedDocumentField(Account))

  meta = {
      'collection': 'users',
      'indexes': ['accounts.account_id', 'user_id'],
  }

  @staticmethod
  def NewUserId():
    """Generates a new user ID.

    The user ID is based on the process ID and current time in microseconds.
    """
    return '%d-%d' % (
        os.getpid(), int(time.time() * 1000000))
