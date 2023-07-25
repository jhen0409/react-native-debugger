import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import {
  Tabs, Toolbar, Button, Divider,
} from '@redux-devtools/ui'
import { GoBook } from 'react-icons/go'
import styled from 'styled-components'
import { changeSection } from '@redux-devtools/app/lib/esm/actions'
import { shell } from 'electron'

const WindowDraggable = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
  -webkit-user-select: none;
`

const tabs = [{ name: 'Actions' }, { name: 'Settings' }]

function Header(props) {
  const { section } = props

  const dispatch = useDispatch()

  const handleChangeSection = useCallback(
    (sec) => dispatch(changeSection(sec)),
    [dispatch, changeSection],
  )

  const openHelp = useCallback(() => shell.openExternal('https://goo.gl/SHU4yL'), [])

  return (
    <Toolbar compact noBorder borderPosition="bottom">
      <Tabs
        main
        collapsible
        tabs={tabs}
        onClick={handleChangeSection}
        selected={section || 'Actions'}
        style={{ flex: 'unset' }}
      />
      <WindowDraggable />
      <Divider />
      <Button
        title="Documentation"
        tooltipPosition="bottom"
        onClick={openHelp}
      >
        <GoBook />
      </Button>
    </Toolbar>
  )
}

Header.propTypes = {
  section: PropTypes.string.isRequired,
}

export default Header
