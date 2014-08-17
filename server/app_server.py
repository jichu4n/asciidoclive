# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""WSGI container for the server."""

from lib import app_server_lib

# Export application object following the WSGI specification.
# pylint: disable=invalid-name
application = app_server_lib.app
# pylint: enable=invalid-name
