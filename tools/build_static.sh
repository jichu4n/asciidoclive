#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Script to build static files for the site.

set -x

ROOT_DIR=$(realpath "$(dirname $0)/..")
SCSS_DIR="$ROOT_DIR/scss"
STATIC_DIR="$ROOT_DIR/static"

# Build SCSS files in the SCSS dir to CSS files in the static dir.
function BuildScssFiles() {
  scss \
      --update \
      "$SCSS_DIR:$STATIC_DIR"
}


# Build Dart files in the static dir.
function BuildDartFiles() {
  find \
      "$STATIC_DIR" \
      -name '*.dart' \
      -exec \
      dart2js \
      '{}' \
      -o '{}.js' \
      ';'
}

BuildScssFiles
BuildDartFiles
