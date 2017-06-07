import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const styles = {
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
};

export default class FormInput extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    inputProps: PropTypes.object,
    button: PropTypes.string,
    onInputChange: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultValue = {
    button: 'Confirm',
    inputProps: {
      type: 'input',
    },
  };

  constructor(props) {
    super(props);
    this.state = { value: undefined };
  }

  handleOnChange = evt => {
    const { onInputChange } = this.props;
    let { value } = evt.target;
    if (onInputChange) {
      value = onInputChange(value);
    }
    this.setState({ value });
  };
  handleOnClick = evt => this.props.onSubmit(evt, this.state.value || this.props.inputProps.value);

  render() {
    const { title, inputProps, button } = this.props;
    const { value } = this.state;
    const val = typeof value !== 'undefined' ? value : inputProps.value;
    return (
      <div>
        <div>{title}</div>
        <div style={styles.form}>
          <input {...inputProps} value={val} style={styles.input} onChange={this.handleOnChange} />
          <button style={styles.button} onClick={this.handleOnClick}>
            {button}
          </button>
        </div>
      </div>
    );
  }
}
