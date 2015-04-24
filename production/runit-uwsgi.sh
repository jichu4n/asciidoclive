#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2015 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

set -ex

if [ -z $ENVIRONMENT ]; then
  echo 'Warning: ENVIRONMENT not specified, assuming test'
  ENVIRONMENT=test
fi
case $ENVIRONMENT in
  prod)
    uwsgi_config_file=prod_config.ini
    server_config_file=prod_config.py
    ;;
  test)
    uwsgi_config_file=test_config.ini
    server_config_file=test_config.py
    ;;
  *)
    echo "Unknown ENVIRONMENT: $ENVIRONMENT"
    exit 1
esac

rm -f /src/server/config.py
ln -s /src/server/$server_config_file /src/server/config.py
mkdir -p /var/log/asciidoclive
chown www-data:www-data /var/log/asciidoclive

exec /usr/local/bin/uwsgi \
    --ini /src/production/uwsgi_configs/$uwsgi_config_file
