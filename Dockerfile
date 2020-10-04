FROM node:lts-slim

WORKDIR /usr/app

ADD package.json package.json
ADD package-lock.json package-lock.json
ADD dist/python/requirements.txt requirements.txt

ADD scripts/entrypoint.sh /entrypoint.sh

RUN apt update \
&& apt install -y python python-dev python3 python3-pip python3-setuptools python3-dev build-essential git ca-certificates \
&& npm install --production \
&& pip3 install -r requirements.txt \
&& dpkg --purge python3-dev build-essential git python-dev python \
&& apt -y autoremove

RUN groupadd -g 987 runner \
&& useradd -u 987 -g 987 runner

ENV \
MESOS_MASTER_URL=http://localhost:5050 \
MESOS_STATE_CACHE_TIME=60 \
SESSION_SECRET=unsecure-session-secret \
JWT_SECRET=unsecure-jwt-secret \
HOME=/tmp

USER runner

CMD ["/entrypoint.sh"]
ADD dist dist
