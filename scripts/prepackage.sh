#!/bin/bash

npm run build
cd dist && npm i && cd -

./scripts/patch-react-devtools.sh
