# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Set up execution environment."""

from flask.ext import mongoengine
import logging
import os
import sys
import traceback

# Set up configs from the config file.
try:
  import config
except ImportError:
  print(
      'Failed to import config.\n'
      '\n'
      'Please create a symlink named \'config.py\' in the app root directory '
      'to either prod_config.py or test_config.py.',
      file=sys.stderr)
  sys.exit(1)

CONFIG = config.CONFIG


# Log file path.
_LOG_FILE_LOGGING_HANDLER = logging.FileHandler(CONFIG.LOG_FILE_PATH)
_CONSOLE_LOGGING_HANDLER = logging.StreamHandler(sys.stderr)
# Set up logging.
logging.basicConfig(
    level=logging.DEBUG,
    style='{',
    format='{levelname:.1}{asctime} {filename}:{lineno}] {message}',
    handlers=(_LOG_FILE_LOGGING_HANDLER, _CONSOLE_LOGGING_HANDLER))

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

# MongoEngine handle.
DB = mongoengine.MongoEngine()

# Maximum source text size allowed, in bytes.
MAX_SOURCE_TEXT_SIZE = 32 * 1024
