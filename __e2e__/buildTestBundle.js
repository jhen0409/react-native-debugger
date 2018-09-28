import path from 'path';
import webpack from 'webpack';

const outputPath = '__e2e__/fixture';
const filename = 'app.bundle.js';

export const bundlePath = path.join(outputPath, filename);

// Build a bundle for simulate RNDebugger worker run react-native bundle,
// it included redux, mobx, remotedev tests
export default function buildTestBundle() {
  return new Promise(resolve =>
    webpack({
      mode: 'development',
      entry: './__e2e__/fixture/app',
      output: {
        path: path.resolve(__dirname, '..', outputPath),
        filename,
      },
      resolve: {
        mainFields: ['main', 'browser'],
      },
    }).run(resolve)
  );
}
