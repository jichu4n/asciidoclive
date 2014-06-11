# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Set up common execution environment for our scripts."""

from flask.ext import mongoengine
import logging
import os
import sys
import traceback


# Log file path.
LOG_FILE_PATH = '/var/log/asciidoclive/app_server.log'
_LOG_FILE_LOGGING_HANDLER = logging.FileHandler(LOG_FILE_PATH)
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

# MongoDB database name.
DB_NAME = 'asciidoclive'
# MongoEngine handle.
DB = mongoengine.MongoEngine()

# Maximum source text size allowed, in bytes.
MAX_SOURCE_TEXT_SIZE = 32 * 1024
