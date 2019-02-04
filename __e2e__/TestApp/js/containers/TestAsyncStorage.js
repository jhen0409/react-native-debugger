import React from 'react';
import { StyleSheet, View, AsyncStorage } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class TestAsyncStorage extends React.Component {
  componentDidMount() {
    AsyncStorage.setItem('some', 'key');
  }
  render() {
    return <View style={styles.container} />;
  }
}
