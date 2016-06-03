#!/bin/bash

git clone https://github.com/facebook/react-devtools.git node_modules/react-devtools
cd node_modules/react-devtools && git checkout 627a04ebfea8d6186ebf73c8be42b44f2ecdf346
cd ../..
rm -rf node_modules/react-devtools/.*

npm run build:devtools
