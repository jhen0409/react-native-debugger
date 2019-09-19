import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { observer } from 'mobx-react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

@observer
export default class Counter extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  increment = () => {
    this.props.store.increment();
  };

  decrement = () => {
    this.props.store.decrement();
  };

  incrementIfOdd = () => {
    this.props.store.incrementIfOdd();
  };

  incrementAsync = () => {
    this.props.store.incrementAsync();
  };

  render() {
    const { store } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Clicked: {store.counter} times</Text>
        <TouchableHighlight onPress={this.increment}>
          <Text style={styles.text}>+</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this.decrement}>
          <Text style={styles.text}>-</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this.incrementIfOdd}>
          <Text style={styles.text}>Increment if odd</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this.incrementAsync}>
          <Text style={styles.text}>Increment async</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
