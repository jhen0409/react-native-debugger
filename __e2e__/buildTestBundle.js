import webpack from 'webpack';

export const bundlePath = '__e2e__/fixture/app.bundle.js';

// Build a bundle for simulate RNDebugger worker run react-native bundle,
// it included redux, mobx, remotedev tests
export default function buildTestBundle() {
  return new Promise(resolve =>
    webpack({
      entry: './__e2e__/fixture/app',
      output: {
        filename: `./${bundlePath}`,
      },
      resolve: {
        mainFields: ['main', 'browser'],
      },
    }).run(resolve)
  );
}
