# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                           Copyright 2016 Chuan Ji                         #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Dockerfile for NGINX server hosting amoya. Build with build.sh.

FROM nginx

COPY nginx-server.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

