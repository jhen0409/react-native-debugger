import { createStackNavigator, createAppContainer } from 'react-navigation';
import Home from './Home';
import TestContextMenu from './containers/TestContextMenu';

const AppNavigator = createStackNavigator(
  {
    Home: { screen: Home },
    TestContextMenu: { screen: TestContextMenu },
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  }
);

export default createAppContainer(AppNavigator);
