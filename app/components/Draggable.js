import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const styles = {
  draggable: {
    position: 'relative',
    zIndex: 1,
    cursor: 'ns-resize',
    padding: '3px 0',
    margin: '-3px 0',
    width: '100%',
  },
};

export default class Draggable extends PureComponent {
  static propTypes = {
    onStart: PropTypes.func,
    onMove: PropTypes.func.isRequired,
    onStop: PropTypes.func,
  };

  onMove = evt => {
    evt.preventDefault();
    this.props.onMove(evt.pageX, evt.pageY);
  };

  onUp = evt => {
    evt.preventDefault();
    const doc = this.node.ownerDocument;
    doc.removeEventListener('mousemove', this.onMove);
    doc.removeEventListener('mouseup', this.onUp);
    if (this.props.onStop) {
      this.props.onStop();
    }
  };

  onRef = ref => (this.node = ref);

  startDragging = evt => {
    evt.preventDefault();
    const doc = this.node.ownerDocument;
    doc.addEventListener('mousemove', this.onMove);
    doc.addEventListener('mouseup', this.onUp);
    if (this.props.onStart) {
      this.props.onStart();
    }
  };

  render() {
    return <div ref={this.onRef} style={styles.draggable} onMouseDown={this.startDragging} />;
  }
}
