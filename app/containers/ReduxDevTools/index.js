import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { stringify } from 'jsan';

import { getFromStorage, saveToStorage } from 'remotedev-app/lib/utils/localStorage';
import enhance from 'remotedev-app/lib/hoc';
import styles from 'remotedev-app/lib/styles';
import DevTools from 'remotedev-app/lib/containers/DevTools';
import MonitorSelector from 'remotedev-app/lib/components/MonitorSelector';
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import TestGenerator from 'remotedev-app/lib/components/TestGenerator';

import createDevStore from 'remotedev-app/lib/store/createDevStore';
import updateState from 'remotedev-app/lib/store/updateState';

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

  state = {
    monitor: getFromStorage('select-monitor') || 'InspectorMonitor',
    dispatcherIsOpen: false,
    sliderIsOpen: false,
    store: createDevStore((type, action, id, bareState) => {
      let state = bareState;
      if (type !== 'IMPORT') state = stringify(state);

      const { worker } = this.props.debugger;
      if (worker) {
        worker.postMessage({
          method: 'emitReduxMessage',
          content: { type, action, state },
        });
      }
    }),
  };

  // Avoid createDevTools get store of this app
  getChildContext = () => ({
    store: null,
  });

  componentWillMount() {
    this.testComponent = (
      <TestGenerator
        useCodemirror
        testTemplates={getFromStorage('test-templates')}
        selectedTemplate={getFromStorage('test-templates-sel')}
      />
    );
  }

  componentDidMount() {
    const { worker } = this.props.debugger;
    if (worker) {
      worker.addEventListener('message', this.workerOnMessage);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { prevWorker } = this.props.debugger;
    const { worker } = nextProps.debugger;
    if (worker && prevWorker !== worker) {
      worker.addEventListener('message', this.workerOnMessage);
    } else if (!worker) {
      this.state.store.clear();
    }
  }

  componentWillUnmount() {
    const { worker } = this.props.debugger;
    if (worker) {
      worker.removeEventListener('message', this.workerOnMessage);
    }
  }

  workerOnMessage = message => {
    const { data } = message;
    if (data && data.__IS_REDUX_NATIVE_MESSAGE__) {
      const { content: msg } = data;
      updateState(this.state.store, msg);
    }
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
    const { store } = this.state;
    const { monitor } = this.state;
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
            <DevTools
              monitor="DispatchMonitor"
              store={store}
              dispatchFn={store.dispatch}
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
          <ImportButton importState={store.liftedStore.importState} />
          <ExportButton exportState={store.liftedStore.getState} />
        </div>
      </div>
    );
  }
}
