#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2015 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

set -ex

/src/production/build.sh

mkdir -p /etc/service/uwsgi
cp /src/production/runit-uwsgi.sh /etc/service/uwsgi/run

mkdir -p /etc/service/apache
cp /src/production/apache_configs/prod_config.conf /etc/apache2/sites-available/
cp /src/production/apache_configs/test_config.conf /etc/apache2/sites-available/
cp /src/production/runit-apache.sh /etc/service/apache/run

chown -R www-data:www-data /src
