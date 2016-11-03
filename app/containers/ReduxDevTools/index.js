import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SliderMonitor from 'remotedev-slider/lib/Slider';

import enhance from 'remotedev-app/lib/hoc';
import styles from 'remotedev-app/lib/styles';
import { liftedDispatch } from 'remotedev-app/lib/actions';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';

import DevTools from 'remotedev-app/lib/containers/DevTools';
import Dispatcher from 'remotedev-app/lib/containers/monitors/Dispatcher';
import Notification from 'remotedev-app/lib/components/Notification';
import Instances from 'remotedev-app/lib/components/Instances';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import TestGenerator from 'remotedev-app/lib/components/TestGenerator';

import ButtonBar from './ButtonBar';

const sliderStyle = {
  padding: '15px 5px',
  backgroundColor: 'rgb(53, 59, 70)',
  color: 'white',
};

@enhance
@connect(
  state => {
    const instances = state.instances;
    const id = getActiveInstance(instances);
    return {
      selected: instances.selected,
      liftedState: instances.states[id],
      options: instances.options[id],
      monitor: state.monitor.selected,
      dispatcherIsOpen: state.monitor.dispatcherIsOpen,
      sliderIsOpen: state.monitor.sliderIsOpen,
    };
  },
  dispatch => ({
    liftedDispatch: bindActionCreators(liftedDispatch, dispatch),
    dispatch,
  }),
)
export default class ReduxDevTools extends Component {
  static propTypes = {
    style: PropTypes.object,
    debugger: PropTypes.object,
    liftedDispatch: PropTypes.func.isRequired,
    selected: PropTypes.string,
    liftedState: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    monitor: PropTypes.string,
    dispatcherIsOpen: PropTypes.bool,
    sliderIsOpen: PropTypes.bool,
  };

  render() {
    const { monitor, dispatcherIsOpen, sliderIsOpen, options, liftedState } = this.props;
    options.lib = 'redux';  // for currently
    return (
      <div style={styles.container}>
        <div style={styles.buttonBar}>
          <MonitorSelector selected={monitor} />
          <Instances selected={this.props.selected} />
        </div>
        <DevTools
          monitor={monitor}
          liftedState={liftedState}
          dispatch={this.props.liftedDispatch}
          testComponent={options.lib === 'redux' && TestGenerator}
        />
        <Notification />
        {sliderIsOpen && options.connectionId &&
          <SliderMonitor
            monitor="SliderMonitor"
            liftedState={liftedState}
            dispatch={this.props.liftedDispatch}
            showActions={monitor === 'ChartMonitor'}
            style={sliderStyle}
            fillColor="rgb(120, 144, 156)"
          />
        }
        {dispatcherIsOpen && options.connectionId &&
          <Dispatcher options={options} />
        }
        <ButtonBar
          liftedState={liftedState}
          dispatcherIsOpen={dispatcherIsOpen}
          sliderIsOpen={sliderIsOpen}
          lib={options.lib}
          noSettings
        />
      </div>
    );
  }
}
