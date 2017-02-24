#!/bin/sh

echo '\n\n## PATCH REACT DEVTOOLS\n'

FILE='./dist/node_modules/react-devtools-core/vendor/backend-1.0.6.js'

TARGET='window.requestIdleCallback'
REPLACE='window.__REQUEST_IDLE_CALLBACK_REPLACED_BY_PATCH__'
sed -i '' s/$TARGET/$REPLACE/g  $FILE

TARGET='window.cancelIdleCallback'
REPLACE='window.__CANCEL_IDLE_CALLBACK_REPLACED_BY_PATCH__'
sed -i '' s/$TARGET/$REPLACE/g  $FILE
