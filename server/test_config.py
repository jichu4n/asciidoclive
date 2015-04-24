# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Test configuration settings for the app server.

This is a config module intended to be used with Flask.
"""

import os
import prod_config


class TestConfig(prod_config.ProdConfig):
  """Config settings for test instances."""

  DEBUG = True
  TESTING = True

  SECRET_KEY = (
      b'\x03\x05v\x04\x12/\xbb}>\x9a\x99v\x8f\x90B\xca\x88lY\x13\x86i9\x8a')

  PREFERRED_URL_SCHEME = 'http'

  MONGODB_SETTINGS = {
      'DB': 'asciidoclive-test',
      'host': os.environ.get(
          'MONGODB_PORT_27017_TCP_ADDR', 'localhost'),
      'port': int(os.environ.get(
          'MONGODB_PORT_27017_TCP_PORT', '27017')),
  }

  LOG_FILE_PATH = '/var/log/asciidoclive/test.log'


CONFIG = TestConfig
