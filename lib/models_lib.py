# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""MongoEngine models."""

from flask.ext import login
import os
import random
import string
import time

from lib import env_lib
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


class User(DB.Document, login.UserMixin):
  """A user in our system.

  A single user may be logged in to accounts from multiple account providers;
  for example, a user may be simultaneously logged in to Facebook and Google.

  This class also provides the required interface for Flask-Login.
  """

  # Our very own user ID :)
  user_id = DB.StringField(required=True, unique=True)
  # Accounts from account providers.
  accounts = DB.ListField(DB.EmbeddedDocumentField(Account))
  # Name to display in greetings.
  greeting_name = DB.StringField(required=True)

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

  # pylint: disable=invalid-name
  def get_id(self):
    """Returns the user ID.

    This is a method required by Flask-Login.
    """
    return self.user_id
  # pylint: enable=invalid-name


@env_lib.LOGIN_MANAGER.user_loader
def GetUser(user_id):
  """Login manager binding for retrieving a user by ID."""
  return User.objects(user_id=user_id).first()


class UserDocument(DB.Document):
  """A source document owned by a user."""

  # Valid characters in document IDs.
  DOCUMENT_ID_CHARS = string.ascii_letters + string.digits
  # The length of document IDs. The max number of different document IDs is
  # len(DOCUMENT_ID_CHARS) ^ DOCUMENT_ID_LENGTH.
  DOCUMENT_ID_LENGTH = 7

  # ID of this document. This can be generated with NewDocumentId().
  document_id = DB.StringField(required=True, unique=True)
  # The owner of this document.
  owner = DB.ReferenceField(User, required=True)
  # The title.
  title = DB.StringField()
  # The source text of this document.
  text = DB.StringField(required=True)
  # Rendered screenshot of the output, in PNG.
  output_thumbnail = DB.BinaryField()

  meta = {
      'collection': 'user_documents',
      'indexes': ['document_id', 'owner'],
  }

  @classmethod
  def NewDocumentId(cls):
    """Generates a new random document ID.

    The output is an alphanumeric string DOCUMENT_ID_LENGTH characters long.
    """
    return ''.join(
        random.choice(cls.DOCUMENT_ID_CHARS)
        for i in range(cls.DOCUMENT_ID_LENGTH))

  @classmethod
  def IsValidDocumentId(cls, document_id):
    """Returns whether the provided ID can be a valid document ID.

    This does NOT check for the existence of the actual document in the
    datastore.
    """
    return (
        len(document_id) == cls.DOCUMENT_ID_LENGTH and
        c in cls.DOCUMENT_ID_CHARS for c in document_id)

  @classmethod
  def Get(cls, document_id):
    """Fetches a document by document ID.

    Returns:
      The document in the datastore with the given document ID. If the document
      ID does not correspond to an existing document, or is invalid, returns
      None.
    """
    if not cls.IsValidDocumentId(document_id):
      return None
    return cls.objects(document_id=document_id).first()

  def IsWritableByUser(self, user):
    """Returns whether this document is writable by a user.

    Args:
      user: a User instance.
    """
    # TODO(cji): Support sharing.
    return user.is_authenticated() and self.owner.id == user.id

  def IsReadableByUser(self, user):
    """Returns whether this document is readable by a user.

    Args:
      user: a User instance.
    """
    # TODO(cji): Support sharing.
    return user.is_authenticated() and self.owner.id == user.id
