#!/bin/bash

git clone https://github.com/jhen0409/react-devtools.git node_modules/react-devtools
cd node_modules/react-devtools && git checkout rndebugger
cd ../..
rm -rf node_modules/react-devtools/.*

npm run build:devtools

# Test fixture
webpack test/e2e/fixture/app.js test/e2e/fixture/app.bundle.js