#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Script to build static files for the site.

# Directory paths.
ROOT_DIR=$(realpath "$(dirname $0)/..")
CLIENT_DIR="$ROOT_DIR/client"
SITE_DIR="$ROOT_DIR/site"


# Build client-side code in the static dir.
function BuildClient() {
  ( set -x;
    cd "$CLIENT_DIR";
    pub get;
    for f in web/*.dart; do
      dart2js --analyze-only --show-package-warnings "$f";
    done;
    pub build;
    cp -R build/web/* "$SITE_DIR"/ )
}

# Copy misc assets into the static dir.
function CopyAssets() {
  ( set -x;
    cp "$CLIENT_DIR"/web/*.dart "$SITE_DIR"/;
    cp -R "$CLIENT_DIR"/lib "$SITE_DIR"/;
    cp -R -L "$CLIENT_DIR"/packages "$SITE_DIR"/;
    cp misc/logo.png "$SITE_DIR"/static/ )
}


TIMEFORMAT=$'\033[32m[ %Us ]\033[m'
while true; do
  mkdir -p "$SITE_DIR"
  rm -r "$SITE_DIR"/*
  time BuildClient
  time CopyAssets
  chmod -R o+r "$SITE_DIR"
  echo
  echo -n 'Rebuild? [Y/n] '
  read r
  if [ -n "$r" ] && [ "$r" != 'y' ]; then
    break
  fi
done
