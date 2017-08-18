#!/bin/sh

echo '\n\n## Patch react-devtools-core\n'

FILE='./dist/node_modules/react-devtools-core/vendor/backend-1.0.6.js'

TARGET='window.requestIdleCallback'
REPLACE='window.__REQUEST_IDLE_CALLBACK_REPLACED_BY_PATCH__'
sed -i '' s/$TARGET/$REPLACE/g  $FILE

TARGET='window.cancelIdleCallback'
REPLACE='window.__CANCEL_IDLE_CALLBACK_REPLACED_BY_PATCH__'
sed -i '' s/$TARGET/$REPLACE/g  $FILE

echo '\n\n## Patch react-dev-utils/launchEditor\n'

FILE='./node_modules/react-dev-utils/launchEditor.js'

TARGET="require('chalk')"
REPLACE='{red:f=>f,cyan:f=>f,green:f=>f}'
sed -i '' s/$TARGET/$REPLACE/g  $FILE

