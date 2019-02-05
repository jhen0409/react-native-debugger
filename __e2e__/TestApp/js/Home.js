import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Button } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class Home extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };
  render() {
    const { navigation } = this.props;
    return (
      <View testID="home" style={styles.container}>
        <Button
          testID="navigate-context-menu"
          title="Test Context Menu"
          onPress={() => navigation.navigate('TestContextMenu')}
        />
      </View>
    );
  }
}
