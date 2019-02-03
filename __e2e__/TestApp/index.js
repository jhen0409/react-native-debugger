/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */
import { AppRegistry, NativeModules } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Enforce app use debug mode
if (__DEV__) {
  console.disableYellowBox = true;
  NativeModules.DevSettings.setIsDebuggingRemotely(true);
}

AppRegistry.registerComponent(appName, () => App);
