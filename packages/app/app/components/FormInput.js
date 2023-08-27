import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

const styles = {
  title: { textAlign: 'center' },
  form: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  input: {
    appearance: 'none',
    fontSize: '16px',
    margin: 2,
    padding: '8px',
    border: 0,
    borderRadius: 2,
  },
  button: {
    fontSize: '16px',
    margin: 2,
    padding: '8px',
    border: 0,
    borderRadius: 2,
  },
}

export default class FormInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { value: undefined }
  }

  handleOnChange = (evt) => {
    const { onInputChange } = this.props
    let { value } = evt.target
    if (onInputChange) {
      value = onInputChange(value)
    }
    this.setState({ value })
  }

  handleClick = (evt) => {
    const { inputProps, onSubmit } = this.props
    const { value } = this.state
    onSubmit(evt, value || inputProps.value)
  }

  render() {
    const { title, inputProps, button } = this.props
    const { value } = this.state
    const val = typeof value !== 'undefined' ? value : inputProps.value
    return (
      <div>
        <div style={styles.title}>{title}</div>
        <div style={styles.form}>
          <input
            onKeyDown={(e) => {
              // Enter/Return key pressed
              if (e.key === 'Enter') this.handleClick()
            }}
            type={inputProps.type}
            value={val}
            style={styles.input}
            onChange={this.handleOnChange}
          />
          <button type="button" style={styles.button} onClick={this.handleClick}>
            {button}
          </button>
        </div>
      </div>
    )
  }
}

FormInput.propTypes = {
  title: PropTypes.string.isRequired,
  inputProps: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
  }),
  button: PropTypes.string,
  onInputChange: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
}

FormInput.defaultProps = {
  inputProps: { type: 'input' },
  button: 'Confirm',
  onInputChange: null,
}
