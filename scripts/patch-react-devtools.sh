#!/bin/sh

echo '\n\n## PATCH REACT DEVTOOLS\n'

FILE='./node_modules/react-devtools-core/build/backend.js'
SOURCE_MAP='./node_modules/react-devtools-core/build/backend.js.map'

TARGET='window.requestIdleCallback'
REPLACE='window.__REQUEST_IDLE_CALLBACK_REPLACED_BY_PATCH__'
sed -i '' s/$TARGET/$REPLACE/g  $FILE
sed -i '' s/$TARGET/$REPLACE/g  $SOURCE_MAP

TARGET='window.cancelIdleCallback'
REPLACE='window.__CANCEL_IDLE_CALLBACK_REPLACED_BY_PATCH__'
sed -i '' s/$TARGET/$REPLACE/g  $FILE
sed -i '' s/$TARGET/$REPLACE/g  $SOURCE_MAP
