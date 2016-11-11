#!/bin/bash

rm -rf app/react-devtools
git clone https://github.com/jhen0409/react-devtools.git app/react-devtools
cd app/react-devtools && git checkout rndebugger
cd ../..
rm -rf app/react-devtools/.*

npm run build:devtools
