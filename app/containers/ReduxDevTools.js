import 'remotedev-monitor-components/lib/presets';

import React, { Component } from 'react';
import { shell } from 'electron';
import PropTypes from 'prop-types';
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

// Button bar
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
import LockButton from 'remotedev-app/lib/components/buttons/LockButton';
import RecordButton from 'remotedev-app/lib/components/buttons/RecordButton';
import PrintButton from 'remotedev-app/lib/components/buttons/PrintButton';
import Button from 'remotedev-app/lib/components/Button';
// eslint-disable-next-line
import HelpIcon from 'react-icons/lib/fa/lightbulb-o';

const sliderStyle = {
  padding: '15px 5px',
  backgroundColor: 'rgb(53, 59, 70)',
  color: 'white',
};
const containerStyle = {
  ...styles.container,
  fontSize: 12,
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
  })
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

  openHelp = () => shell.openExternal('https://goo.gl/SHU4yL');

  render() {
    const {
      selected,
      monitor,
      dispatcherIsOpen,
      sliderIsOpen,
      liftedState,
      liftedDispatch,
      monitorState,
      options,
    } = this.props;
    const isRedux = options.lib === 'redux';
    const isConnected = !!options.connectionId;
    const isSliderOpen = sliderIsOpen && isConnected;
    const isDispathcerOpen = dispatcherIsOpen && isConnected;
    return (
      <div className="redux-container" style={containerStyle}>
        <div style={styles.buttonBar}>
          <MonitorSelector selected={monitor} />
          <Instances selected={selected} />
        </div>
        <DevTools
          monitor={monitor}
          liftedState={liftedState}
          monitorState={monitorState}
          dispatch={liftedDispatch}
          lib={options.lib}
        />
        <Notification />
        {isSliderOpen && (
          <SliderMonitor
            monitor="SliderMonitor"
            liftedState={liftedState}
            dispatch={liftedDispatch}
            showActions={monitor === 'ChartMonitor'}
            style={sliderStyle}
            fillColor="rgb(120, 144, 156)"
          />
        )}
        {isDispathcerOpen && <Dispatcher options={options} />}
        <div className="redux-buttonbar" style={styles.buttonBar}>
          {isRedux && <RecordButton paused={liftedState.isPaused} />}
          {isRedux && <LockButton locked={liftedState.isLocked} />}
          <DispatcherButton dispatcherIsOpen={dispatcherIsOpen} />
          <SliderButton isOpen={sliderIsOpen} />
          <ImportButton />
          <ExportButton liftedState={liftedState} />
          <PrintButton />
          {!isConnected && (
            <Button Icon={HelpIcon} onClick={this.openHelp}>
              How to use
            </Button>
          )}
        </div>
      </div>
    );
  }
}
