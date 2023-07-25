/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react'
import Tabs from '@redux-devtools/ui/lib/esm/Tabs/Tabs'
import Themes from '@redux-devtools/app/lib/esm/components/Settings/Themes'

export default class Settings extends Component {
  tabs = [
    { name: 'Themes', component: Themes },
  ]

  constructor(props) {
    super(props)
    this.state = { selected: 'Themes' }
  }

  handleSelect = (selected) => {
    this.setState({ selected })
  }

  render() {
    const { selected } = this.state
    return (
      <Tabs
        tabs={this.tabs}
        selected={selected}
        onClick={this.handleSelect}
      />
    )
  }
}
