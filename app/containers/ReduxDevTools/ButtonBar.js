import React, { Component, PropTypes } from 'react';
import DispatcherButton from 'remotedev-app/lib/components/buttons/DispatcherButton';
import ImportButton from 'remotedev-app/lib/components/buttons/ImportButton';
import ExportButton from 'remotedev-app/lib/components/buttons/ExportButton';
import SliderButton from 'remotedev-app/lib/components/buttons/SliderButton';
import LockButton from 'remotedev-app/lib/components/buttons/LockButton';
import RecordButton from 'remotedev-app/lib/components/buttons/RecordButton';
import PrintButton from 'remotedev-app/lib/components/buttons/PrintButton';
import styles from 'remotedev-app/lib/styles';

export default class ButtonBar extends Component {
  static propTypes = {
    liftedState: PropTypes.object.isRequired,
    dispatcherIsOpen: PropTypes.bool,
    sliderIsOpen: PropTypes.bool,
    lib: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.dispatcherIsOpen !== this.props.dispatcherIsOpen
      || nextProps.sliderIsOpen !== this.props.sliderIsOpen
      || nextProps.lib !== this.props.lib
      || nextProps.liftedState.isLocked !== this.props.liftedState.isLocked
      || nextProps.liftedState.isPaused !== this.props.liftedState.isPaused;
  }

  render() {
    const isRedux = this.props.lib === 'redux';
    return (
      <div
        className="redux-buttonbar"
        style={styles.buttonBar}
      >
        {isRedux &&
          <RecordButton paused={this.props.liftedState.isPaused} />
        }
        {isRedux &&
          <LockButton locked={this.props.liftedState.isLocked} />
        }
        <DispatcherButton dispatcherIsOpen={this.props.dispatcherIsOpen} />
        <SliderButton isOpen={this.props.sliderIsOpen} />
        <ImportButton />
        <ExportButton liftedState={this.props.liftedState} />
        <PrintButton />
      </div>
    );
  }
}
