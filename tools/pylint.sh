#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Invokes pylint on local Python sources.

set -x

cd "$(dirname $0)/.."
PYTHONPATH="$PWD" pylint \
    --disable=I \
    --disable=no-self-use \
    $(find . -name '*.py')
