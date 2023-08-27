import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

const styles = {
  draggable: {
    position: 'relative',
    zIndex: 1,
    cursor: 'ns-resize',
    padding: '3px 0',
    margin: '-3px 0',
    width: '100%',
  },
}

export default class Draggable extends PureComponent {
  onMove = (evt) => {
    evt.preventDefault()
    const { onMove } = this.props
    onMove?.(evt.pageX, evt.pageY)
  }

  onUp = (evt) => {
    evt.preventDefault()
    document.removeEventListener('mousemove', this.onMove)
    document.removeEventListener('mouseup', this.onUp)
    const { onStop } = this.props
    onStop?.()
  }

  startDragging = (evt) => {
    evt.preventDefault()
    document.addEventListener('mousemove', this.onMove)
    document.addEventListener('mouseup', this.onUp)
    const { onStart } = this.props
    onStart?.()
  }

  render() {
    return (
      <div
        role="button"
        tabIndex="0"
        aria-label="Draggable"
        style={styles.draggable}
        onMouseDown={this.startDragging}
      />
    )
  }
}

Draggable.propTypes = {
  onStart: PropTypes.func,
  onMove: PropTypes.func.isRequired,
  onStop: PropTypes.func,
}

Draggable.defaultProps = {
  onStart: undefined,
  onStop: undefined,
}
