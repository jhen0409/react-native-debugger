#!/bin/bash -e



git clone https://github.com/creationix/nvm.git /tmp/.nvm
source /tmp/.nvm/nvm.sh
nvm install "$NODE_VERSION"
nvm use --delete-prefix "$NODE_VERSION"

node --version
npm --version

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  sleep 3
elif [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  brew update
  brew install yarn
  brew tap wix/brew
  brew install applesimutils
fi

cd __e2e__/TestApp && yarn && cd ..
yarn
cd npm-package && yarn && cd ..
yarn lint
yarn test
yarn build
yarn test-e2e

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  yarn build-test-ios
  yarn test-ios
fi
