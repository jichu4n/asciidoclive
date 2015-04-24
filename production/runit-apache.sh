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
    apache_config_file=prod_config.conf
    ;;
  test)
    apache_config_file=test_config.conf
    ;;
  *)
    echo "Unknown ENVIRONMENT: $ENVIRONMENT"
    exit 1
esac

pushd /etc/apache2/mods-enabled
for m in \
    macro.load \
    ssl.load \
    ssl.conf \
    rewrite.load \
    proxy.load \
    proxy_http.load \
    proxy.conf \
    socache_shmcb.load ; do
  [ -e $m ] || ln -s ../mods-available/$m
done
popd

pushd /etc/apache2/sites-enabled
rm -f *
ln -s ../sites-available/$apache_config_file 000-default.conf
popd

. /etc/apache2/envvars
mkdir -p \
    $APACHE_RUN_DIR \
    $APACHE_LOCK_DIR
chown $APACHE_RUN_USER:$APACHE_RUN_GROUP \
    $APACHE_RUN_DIR \
    $APACHE_LOCK_DIR
/usr/sbin/apache2 -V
exec /usr/sbin/apache2 -DNO_DETACH
