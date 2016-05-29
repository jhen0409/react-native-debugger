#!/bin/bash

git clone https://github.com/facebook/react-devtools.git node_modules/react-devtools
cd node_modules/react-devtools && git checkout dfe8977860d1ee4298fe18c34dc86012c3d8288e
cd ../..
rm -rf node_modules/react-devtools/.*

npm run build:devtools
