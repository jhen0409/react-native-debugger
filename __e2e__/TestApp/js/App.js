import { createStackNavigator, createAppContainer } from 'react-navigation';
import Home from './Home';
import TestAsyncStorage from './containers/TestAsyncStorage';

const AppNavigator = createStackNavigator(
  {
    Home: { screen: Home },
    TestAsyncStorage: { screen: TestAsyncStorage },
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  }
);

export default createAppContainer(AppNavigator);
