import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getFromStorage, saveToStorage } from 'remotedev-app/lib/utils/localStorage';
import enhance from 'remotedev-app/lib/hoc';
import styles from 'remotedev-app/lib/styles';
import DevTools from 'remotedev-app/lib/containers/DevTools';
import Dispatcher from 'remotedev-app/lib/containers/monitors/Dispatcher';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import TestGenerator from 'remotedev-app/lib/components/TestGenerator';

import { createRemoteStore, setWorker, importState, exportState } from './createRemoteStore';

@enhance
@connect(
  state => ({
    debugger: state.debugger,
  }),
  dispatch => ({ dispatch }),
)
export default class ReduxDevTools extends Component {
  static propTypes = {
    style: PropTypes.object,
    debugger: PropTypes.object,
  };

  static childContextTypes = {
    store: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      monitor: getFromStorage('select-monitor') || 'InspectorMonitor',
      dispatcherIsOpen: false,
      sliderIsOpen: false,
      store: createRemoteStore(this.handleError),
      error: null,
    };
    this.testComponent = p => (
      <TestGenerator
        name="default"
        store={this.state.store}
        isRedux={this.state.store.isRedux()}
        useCodemirror
        testTemplates={getFromStorage('test-templates')}
        selectedTemplate={getFromStorage('test-templates-sel')}
        {...p}
      />
    );
  }

  // Avoid createDevTools get store of this app
  getChildContext = () => ({
    store: null,
  });

  componentDidMount() {
    const { worker } = this.props.debugger;
    setWorker(worker);
  }

  componentWillReceiveProps(nextProps) {
    const { prevWorker } = this.props.debugger;
    const { worker } = nextProps.debugger;
    if (worker && prevWorker !== worker) {
      setWorker(worker);
    } else if (!worker) {
      this.state.store.clear();
      setWorker(null);
    }
  }

  componentWillUnmount() {
    setWorker(null);
  }

  handleError = error => {
    this.setState({ error });
  };

  clearError = () => {
    this.setState({ error: null });
  };

  handleSelectMonitor = (event, index, value) => {
    this.setState({ monitor: saveToStorage('select-monitor', value) });
  };

  toggleDispatcher = () => {
    this.setState({ dispatcherIsOpen: !this.state.dispatcherIsOpen });
  };

  toggleSlider = () => {
    this.setState({ sliderIsOpen: !this.state.sliderIsOpen });
  };

  render() {
    const { store, error, monitor } = this.state;
    return (
      <div style={{ ...styles.container, ...this.props.style }}>
        <div style={styles.buttonBar}>
          <MonitorSelector
            selected={this.state.monitor}
            onSelect={this.handleSelectMonitor}
          />
        </div>
        <DevTools
          key={`${monitor}Monitor`}
          monitor={monitor}
          store={store}
          testComponent={this.testComponent}
        />
        {
          this.state.sliderIsOpen &&
            <div style={styles.sliderMonitor}>
              <DevTools
                key={'Slider'}
                monitor="SliderMonitor"
                store={store}
              />
            </div>
        }
        {
          this.state.dispatcherIsOpen &&
            <Dispatcher
              store={store}
              error={error}
              clearError={this.clearError}
              key={'Dispatch'}
            />
        }
        <div style={styles.buttonBar}>
          <DispatcherButton
            dispatcherIsOpen={this.state.dispatcherIsOpen}
            onClick={this.toggleDispatcher}
          />
          <SliderButton
            isOpen={this.state.sliderIsOpen}
            onClick={this.toggleSlider}
          />
          <ImportButton importState={importState} />
          <ExportButton exportState={exportState} />
        </div>
      </div>
    );
  }
}
