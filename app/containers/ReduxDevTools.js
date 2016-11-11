import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SliderMonitor from 'remotedev-slider/lib/Slider';

import enhance from 'remotedev-app/lib/hoc';
import styles from 'remotedev-app/lib/styles';
import { liftedDispatch as liftedDispatchAction } from 'remotedev-app/lib/actions';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';

import DevTools from 'remotedev-app/lib/containers/DevTools';
import Dispatcher from 'remotedev-app/lib/containers/monitors/Dispatcher';
import Notification from 'remotedev-app/lib/components/Notification';
import Instances from 'remotedev-app/lib/components/Instances';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import TestGenerator from 'remotedev-app/lib/components/TestGenerator';

// Button bar
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
import LockButton from 'remotedev-app/lib/components/buttons/LockButton';
import RecordButton from 'remotedev-app/lib/components/buttons/RecordButton';
import PrintButton from 'remotedev-app/lib/components/buttons/PrintButton';

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
      monitorState: state.monitor.monitorState,
      options: instances.options[id],
      monitor: state.monitor.selected,
      dispatcherIsOpen: state.monitor.dispatcherIsOpen,
      sliderIsOpen: state.monitor.sliderIsOpen,
    };
  },
  dispatch => ({
    liftedDispatch: bindActionCreators(liftedDispatchAction, dispatch),
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
    monitorState: PropTypes.object,
    options: PropTypes.object.isRequired,
    monitor: PropTypes.string,
    dispatcherIsOpen: PropTypes.bool,
    sliderIsOpen: PropTypes.bool,
  };

  render() {
    const {
      selected, monitor,
      dispatcherIsOpen, sliderIsOpen,
      liftedState, liftedDispatch, monitorState,
      options,
    } = this.props;
    const isRedux = options.lib === 'redux';
    return (
      <div
        className="redux-container"
        style={styles.container}
      >
        <div style={styles.buttonBar}>
          <MonitorSelector selected={monitor} />
          <Instances selected={selected} />
        </div>
        <DevTools
          monitor={monitor}
          liftedState={liftedState}
          monitorState={monitorState}
          dispatch={liftedDispatch}
          testComponent={isRedux && TestGenerator}
        />
        <Notification />
        {sliderIsOpen && options.connectionId &&
          <SliderMonitor
            monitor="SliderMonitor"
            liftedState={liftedState}
            dispatch={liftedDispatch}
            showActions={monitor === 'ChartMonitor'}
            style={sliderStyle}
            fillColor="rgb(120, 144, 156)"
          />
        }
        {dispatcherIsOpen && options.connectionId &&
          <Dispatcher options={options} />
        }
        <div
          className="redux-buttonbar"
          style={styles.buttonBar}
        >
          {isRedux &&
            <RecordButton paused={liftedState.isPaused} />
          }
          {isRedux &&
            <LockButton locked={liftedState.isLocked} />
          }
          <DispatcherButton dispatcherIsOpen={dispatcherIsOpen} />
          <SliderButton isOpen={sliderIsOpen} />
          <ImportButton />
          <ExportButton liftedState={liftedState} />
          <PrintButton />
        </div>
      </div>
    );
  }
}
