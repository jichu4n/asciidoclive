# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Prod configuration settings for the app server.

This is a config module intended to be used with Flask.
"""


class ProdConfig(object):
  """Config settings for production."""

  DEBUG = False
  TESTING = False

  # Secret key for sessions.
  SECRET_KEY = (
      b'f\n4IY\xe9+(T:\\\xf1\xc8\x13Jr\xc1\x91\x0c\x9c+4\x83\x92')

  # Use HTTPS in prod.
  PREFERRED_URL_SCHEME = 'https'

  # MongoEngine settings.
  MONGODB_SETTINGS = {
      'DB': 'asciidoclive-prod',
  }

  # Session protection mode for Flast-Login.
  SESSION_PROTECTION = 'strong'

  # Custom config settings.

  # App log file location.
  LOG_FILE_PATH = '/var/log/asciidoclive/prod.log'


CONFIG = ProdConfig
