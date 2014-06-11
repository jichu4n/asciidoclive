# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""MongoEngine models."""


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
