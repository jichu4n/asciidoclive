#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Script to build static files for the site.

# Directory paths.
ROOT_DIR=$(realpath "$(dirname $0)/..")
SCSS_DIR="$ROOT_DIR/scss"
DART_DIR="$ROOT_DIR/dart"
STATIC_DIR="$ROOT_DIR/static"


# Build SCSS files in the SCSS dir to CSS files in the static dir.
function BuildScssFiles() {
  ( set -x;
    scss \
        --update \
        "$SCSS_DIR:$STATIC_DIR" )
}


# Build Dart files in the static dir.
function BuildDartFiles() {
  ( set -x;
    cd "$DART_DIR";
    pub get;
    pub build;
    cp -R build/web/* "$STATIC_DIR" )
}

# Copy misc assets into the static dir.
function CopyAssets() {
  ( set -x;
    cp "$DART_DIR"/web/*.dart "$STATIC_DIR";
    cp -R -L "$DART_DIR"/packages "$STATIC_DIR";
    cp -R misc/font-awesome "$STATIC_DIR";
    cp misc/logo.png "$STATIC_DIR" )
}


TIMEFORMAT=$'\033[32m[ %Us ]\033[m'
while true; do
  rm -r "$STATIC_DIR"/*
  time BuildScssFiles
  time CopyAssets
  time BuildDartFiles
  chmod -R o+r "$STATIC_DIR"
  echo
  echo -n 'Rebuild? [Y/n] '
  read r
  if [ -n "$r" ] && [ "$r" != 'y' ]; then
    break
  fi
done
