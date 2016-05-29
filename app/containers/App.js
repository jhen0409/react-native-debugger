import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as debuggerActions from '../actions/debugger';

import Debugger from './Debugger';
import ReduxDevTools from './ReduxDevTools';
import ReactDevTools from './ReactDevTools';

const styles = {
  container: {
    width: '100%',
    heigth: '100%',
  },
  wrapReduxPanel: {
    position: 'fixed',
    display: 'flex',
    width: '100%',
    height: '60%',
  },
  reduxPanel: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  wrapReactPanel: {
    display: 'flex',
    position: 'fixed',
    width: '100%',
    height: '40%',
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
};

@connect(
  state => ({
    debugger: state.debugger,
  }),
  dispatch => bindActionCreators(debuggerActions, dispatch)
)
export default class App extends Component {
  render() {
    return (
      <div style={styles.container}>
        <Debugger />
        <div style={styles.wrapReduxPanel}>
          <ReduxDevTools style={styles.reduxPanel} />
        </div>
        <div style={styles.wrapReactPanel}>
          <ReactDevTools />
        </div>
      </div>
    );
  }
}
