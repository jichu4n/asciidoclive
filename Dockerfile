# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2015 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Container for Amoya server.

FROM phusion/baseimage
MAINTAINER Chuan Ji <ji@chu4n.com>

# Standard baseimage environment.
ENV HOME /root
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
CMD ["/sbin/my_init"]

# Install dependencies.
COPY production/install_deps.sh /tmp/
RUN /tmp/install_deps.sh
COPY server/requirements.txt /tmp/
RUN pip3 install -r /tmp/requirements.txt

COPY . /src
RUN /src/production/setup.sh

# Amoya server.
EXPOSE 22 80 443
