#!/bin/bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
fi

node --version
npm --version

npm install
cd npm-package && npm install && cd ..
npm run lint
npm run build
npm test
