/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react';
import Tabs from '@redux-devtools/ui/lib/esm/Tabs/Tabs';
import Themes from '@redux-devtools/app/lib/esm/components/Settings/Themes';

export default class Settings extends Component {
  state = { selected: 'Themes' };

  tabs = [
    { name: 'Themes', component: Themes },
  ];

  handleSelect = (selected) => {
    this.setState({ selected });
  };

  render() {
    return (
      <Tabs
        tabs={this.tabs}
        selected={this.state.selected}
        onClick={this.handleSelect}
      />
    );
  }
}
