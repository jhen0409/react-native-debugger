# Contributing

## Clone this repo & install dependencies

```bash
# Or fork
$ git clone https://github.com/jhen0409/react-native-debugger
$ cd react-native-debugger
```

## Run on development mode

```bash
$ npm run dev:webpack  # Then open the another terminal tab
$ npm run dev:electron
```

## Run on production mode

```bash
$ npm run build
$ npm start
```

## Run test

Run lint and test, currently we just wrote E2E test for RNDebugger.

```bash
$ npm run lint
$ npm test
```

you need to closes all React Native packager (or just make sure `8081` or `8088` port not listening) when running the test.

## Packaging app

```bash
$ npm run pack-macos
$ npm run pack-linux
$ npm run pack-windows
$ npm run pack # all
```

If you want to build binaries yourself, please remove [../electron/update.js](electron/update.js) (and [../electon/main.js usage](electon/main.js)), `osx-sign` in [../scripts/package-macos.sh](scripts/package-macos.sh).
