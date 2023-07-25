import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Container, Notification } from '@redux-devtools/ui'
import { clearNotification } from '@redux-devtools/app/lib/esm/actions'
import Actions from '@redux-devtools/app/lib/esm/containers/Actions'
import Settings from './Settings'
import Header from './Header'

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
    <Container themeData={theme}>
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
    </Container>
  )
}

export default App
