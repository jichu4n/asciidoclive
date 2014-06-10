# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Library for converting AsciiDoc markup to HTML."""

import logging
import os
import subprocess

from lib import env_lib

# AsciiDoc config files. The default HTML config files do not work when safe
# mode is enabled; hence, we use our own customized config file.
_ASCIIDOC_CONFIG_FILE_PATHS = [
    '/etc/asciidoc/asciidoc.conf',
    os.path.join(env_lib.DATA_DIR, 'html5.conf'),
]
# The AsciiDoc command line.
_ASCIIDOC_COMMAND = [
    '/usr/bin/asciidoc',
    '--out-file=-',
    '--backend=html5',
    '--no-header-footer',
    '--safe',
    '--no-conf',
] + [
    '--conf-file=%s' % file_path
    for file_path in _ASCIIDOC_CONFIG_FILE_PATHS
] + [ '-' ]


def RunAsciiDoc(text):
  """Executes AsciiDoc for the given text.

  Args:
    text: a piece of text in AsciiDoc format.
  Returns:
    A tuple (asciidoc_return_code, asciidoc_stdout, asciidoc_stderr) containing
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
    (asciidoc_stdout, asciidoc_stderr) = asciidoc_proc.communicate(
        text.encode('utf-8'))
    asciidoc_stdout = asciidoc_stdout.decode('utf-8').strip()
    asciidoc_stderr = asciidoc_stderr.decode('utf-8').strip()
    logging.debug('AsciiDoc STDERR:\n%s', asciidoc_stderr)
    return (asciidoc_proc.returncode, asciidoc_stdout, asciidoc_stderr)
