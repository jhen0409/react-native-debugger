#!/bin/bash

git clone https://github.com/creationix/nvm.git /tmp/.nvm
source /tmp/.nvm/nvm.sh
nvm install "$NODE_VERSION"
nvm use --delete-prefix "$NODE_VERSION"

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
elif [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  brew update
  brew install yarn
fi

node --version
npm --version

yarn
cd npm-package && yarn && cd ..
yarn lint
yarn build
yarn test
