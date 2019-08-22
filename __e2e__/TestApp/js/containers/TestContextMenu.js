import React from 'react';
import { StyleSheet, View, AsyncStorage, Button } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class TestContextMenu extends React.Component {
  componentDidMount() {
    AsyncStorage.setItem('some', 'key');
  }
  sendRequest() {
    fetch('http://localhost:8081');
  }
  render() {
    return (
      <View style={styles.container}>
        <Button testID="send-request" title="Send request" />
      </View>
    );
  }
}
