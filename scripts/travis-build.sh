#!/bin/bash -e



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
  brew tap wix/brew
  brew install applesimutils
fi

node --version
npm --version

yarn
cd npm-package && yarn && cd ..
yarn lint
yarn test
yarn build
yarn test-e2e

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  cd __e2e__/TestApp
  yarn
  yarn build-test-ios
  yarn test-ios
fi
