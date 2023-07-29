import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { Container, Notification } from '@redux-devtools/ui'
import { clearNotification } from '@redux-devtools/app/lib/esm/actions'
import Actions from '@redux-devtools/app/lib/esm/containers/Actions'
import Settings from './Settings'
import Header from './Header'

const StyledContainer = styled(Container)`overflow: hidden;`

function App() {
  const section = useSelector((state) => state.section)
  const theme = useSelector((state) => state.theme)
  const notification = useSelector((state) => state.notification)

  const dispatch = useDispatch()

  let body
  switch (section) {
    case 'Settings':
      body = <Settings />
      break
    default:
      body = <Actions />
  }

  return (
    <StyledContainer themeData={theme}>
      <Header section={section} />
      {body}
      {notification && (
        <Notification
          type={notification.type}
          onClose={() => dispatch(clearNotification())}
        >
          {notification.message}
        </Notification>
      )}
    </StyledContainer>
  )
}

export default App
