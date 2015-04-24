#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2015 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

set -ex

export DEBIAN_FRONTEND=noninteractive
# We use --no-install-recommends here because
#     - AsciiDoc by default pulls in all of LaTeX as optional dependencies,
#       which weigh > 1GB.
#     - Node by default pulls in the entire C++ dev toolchain including g++,
#       binutils, flex, bison, gdb, etc.
apt-get update
apt-get install -y --no-install-recommends \
    asciidoc \
    python3-dev \
    python3-pip \
    ruby ruby-dev \
    apache2 \
    build-essential autoconf automake
curl -L -o /tmp/dart.deb \
    https://storage.googleapis.com/dart-archive/channels/stable/release/latest/linux_packages/debian_wheezy/dart_1.9.3-1_amd64.deb
dpkg -i /tmp/dart.deb

pip3 install uwsgi

gem install sass
