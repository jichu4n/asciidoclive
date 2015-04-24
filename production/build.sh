#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Script to build static files for the site.

set -ex

# Directory paths.
export PATH="/usr/lib/dart/bin:$PATH"
ROOT_DIR="$(dirname $0)/.."
CLIENT_DIR="$ROOT_DIR/client"
BUILD_DIR="$ROOT_DIR/build"


# Build client-side code in the static dir.
function BuildClient() {
  ( set -x;
    cd "$CLIENT_DIR";
    pub get;
    for f in web/*.dart; do
      dart2js --analyze-only --show-package-warnings "$f";
    done;
    pub build;
    cp -R build/web/* "$BUILD_DIR"/ )
}

# Copy misc assets into the static dir.
function CopyAssets() {
  ( set -x;
    cp "$CLIENT_DIR"/web/*.dart "$BUILD_DIR"/;
    cp -R "$CLIENT_DIR"/lib "$BUILD_DIR"/;
    cp -R -L "$CLIENT_DIR"/packages "$BUILD_DIR"/;
    cp "$ROOT_DIR/misc/logo.png" "$BUILD_DIR"/static/ )
}


rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
TIMEFORMAT=$'\033[32m[ %Us ]\033[m'
time BuildClient
time CopyAssets
chmod -R o+r "$BUILD_DIR"
