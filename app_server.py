#!/usr/bin/env python3
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""WSGI container for the server and the debug server binary."""

# Add directory containing this file to PYTHONPATH.
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from lib import app_server_lib

# Export application object following the WSGI specification.
# pylint: disable=invalid-name
application = app_server_lib.app
# pylint: enable=invalid-name


# Serve a dev HTTP server if directly invoked.
if __name__ == '__main__':
  application.run(
      '0.0.0.0',
      port=5299,
      debug=True)
