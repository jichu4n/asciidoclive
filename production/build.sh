#!/bin/bash
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                           Copyright 2016 Chuan Ji                         #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Build NGINX server Docker image.

docker_tag="r.chu4n.com/amoya"

root_dir=$(realpath $(dirname $0)/..)
client_dir=$root_dir/client
production_dir=$root_dir/production

set -ex

cd $client_dir
time ember build --environment=production

cd $production_dir
rm -rf dist
cp -a $client_dir/dist ./
docker build -t $docker_tag .
rm -rf dist
docker push $docker_tag

