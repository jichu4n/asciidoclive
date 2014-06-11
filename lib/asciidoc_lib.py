# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Library for converting AsciiDoc markup to HTML."""

import hashlib
import logging
import mongoengine
import os
import time
import subprocess

from lib import env_lib
from lib import models_lib

# AsciiDoc config files. The default HTML config files do not work when safe
# mode is enabled; hence, we use our own customized config file.
_ASCIIDOC_CONFIG_FILE_PATHS = [
    '/etc/asciidoc/asciidoc.conf',
    os.path.join(env_lib.DATA_DIR, 'html5.conf'),
    os.path.join(env_lib.DATA_DIR, 'source-highlight-filter.conf'),
]
# The AsciiDoc command line.
_ASCIIDOC_COMMAND = [
    '/usr/bin/asciidoc',
    '--out-file=-',
    '--backend=html5',
    '--no-header-footer',
    '--attribute=source-highlighter=pygments',
    '--safe',
    '--no-conf',
] + [
    '--conf-file=%s' % file_path
    for file_path in _ASCIIDOC_CONFIG_FILE_PATHS
] + ['-']

# If another process is concurrently running AsciiDoc on the same text, we block
# until that run has finished and reuse its results rather than re-run AsciiDoc.
# This constant specifies how long (in seconds) we wait before re-checking if
# the other process has finished.
_CONCURRENT_RUN_POLL_INTERVAL = 0.1


def _RunAsciiDoc(text):
  """Executes AsciiDoc for the given text.

  Args:
    text: a piece of text in AsciiDoc format.
  Returns:
    A tuple (return_code, stdout_output, stderr_output) containing
    the result of the run.
  """
  # Avoid running AsciiDoc if there is no content.
  text = text.strip()
  if not text:
    return (0, '', '')
  logging.debug(
      'Running AsciiDoc command:\n%s',
      ' \\\n\t'.join(_ASCIIDOC_COMMAND))
  with subprocess.Popen(
      _ASCIIDOC_COMMAND,
      shell=False,
      stdin=subprocess.PIPE,
      stdout=subprocess.PIPE,
      stderr=subprocess.PIPE,
      universal_newlines=False) as asciidoc_proc:
    (stdout_output, stderr_output) = asciidoc_proc.communicate(
        text.encode('utf-8'))
    stdout_output = stdout_output.decode('utf-8').strip()
    stderr_output = stderr_output.decode('utf-8').strip()
    if stderr_output:
      logging.debug('AsciiDoc STDERR:\n%s', stderr_output)
    return (asciidoc_proc.returncode, stdout_output, stderr_output)


def GetAsciiDocResult(text):
  """Returns the result of running AsciiDoc for the given text.

  This will fetch cached results if available. It will commit the result to the
  cache.

  Args:
    asciidoc_cache_collection: a PyMongo collection where AsciiDoc run results
        are cached.
    text: a piece of text in AsciiDoc format.
  Returns:
    A tuple (return_code, stdout_output, stderr_output) containing
    the result of a run of AsciiDoc for the text.
  """
  text = text.strip()
  text_sha1_digest = hashlib.sha1(text.encode('utf-8')).hexdigest()
  cached_result = models_lib.CachedAsciiDocResult()
  cached_result.text_sha1_digest = text_sha1_digest
  try:
    # MongoDB guarantees that this is atomic. This will raise a NotUniqueError
    # if a cached result is available or another process is running AsciiDoc on
    # the same text.
    cached_result.save()
    # If we got here, no cached result is available and no one else is running
    # AsciiDoc on the same text.
    logging.debug('Inserting into cache: %s', text_sha1_digest)
    asciidoc_start_time = time.time()
    (cached_result.return_code,
     cached_result.stdout_output,
     cached_result.stderr_output) = _RunAsciiDoc(text)
    asciidoc_end_time = time.time()
    cached_result.run_ts = int(asciidoc_end_time)
    cached_result.run_time = asciidoc_end_time - asciidoc_start_time
    cached_result.save()
    logging.debug('AsciiDoc run time: %.03fs', cached_result.run_time)
    return (cached_result.return_code,
            cached_result.stdout_output,
            cached_result.stderr_output)
  except mongoengine.errors.NotUniqueError:
    # If we got here, either a cached result is available or another process is
    # currently running AsciiDoc on the same text.
    while True:
      logging.debug('Fetching from cache: %s', text_sha1_digest)
      cached_result = (
          models_lib.CachedAsciiDocResult.objects(
            text_sha1_digest=text_sha1_digest)
          .first())
      if cached_result.run_ts is None:
        time.sleep(_CONCURRENT_RUN_POLL_INTERVAL)
      else:
        return (
            cached_result.return_code,
            cached_result.stdout_output,
            cached_result.stderr_output)
