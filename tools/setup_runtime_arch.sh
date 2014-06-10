#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Set up the runtime environment on Arch Linux.

YAOURT_TMP_DIR=/opt/tmp

# Installs an Arch package if not already installed.
function InstallPackage() {
  local package=$1
  if [ -z "$(yaourt -Q $package)" ]; then
    echo "Installing missing package '$package'"
    yaourt \
        -S \
        --noconfirm \
        --tmp "$YAOURT_TMP_DIR" \
        $package
  else
    echo "Found installed package '$package'"
  fi
}


sudo mkdir -p "$YAOURT_TMP_DIR"
sudo chmod 777 "$YAOURT_TMP_DIR"


# Required packages.
InstallPackage asciidoc
InstallPackage python
InstallPackage python-flask
InstallPackage mod_wsgi
