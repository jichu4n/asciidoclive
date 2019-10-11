#!/bin/bash

set -ex

sed -i '856s/_,/_:any,/' node_modules/ace-builds/ace.d.ts
sed -i '859s/ prefix,/ prefix: any,/' node_modules/ace-builds/ace.d.ts