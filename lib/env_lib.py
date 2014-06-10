# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Set up common execution environment for our scripts."""

import logging
import os
import sys
import traceback


# Set up logging.
logging.basicConfig(
    level=logging.DEBUG,
    style='{',
    format='{levelname:.1}{asctime} {filename}:{lineno}] {message}')

_DEFAULT_LOGGING_FATAL_FN = logging.fatal
def _CrashingLoggingFatalFn(*args, **kwargs):
  """Custom replacement for logging.fatal.

  This function will print out a stack trace and exit the program.
  """
  _DEFAULT_LOGGING_FATAL_FN(*args, **kwargs)
  traceback.print_stack()
  sys.exit(1)

logging.fatal = _CrashingLoggingFatalFn

# Absolute path to the root directory of the application.
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# Path to directory containing Jinja2 templates.
TEMPLATES_DIR = os.path.join(ROOT_DIR, 'templates')
# Path to directory containing static files.
STATIC_DIR = os.path.join(ROOT_DIR, 'static')
# Data directory path.
DATA_DIR = os.path.join(
    os.path.abspath(os.path.dirname(__file__)),
    'data')
