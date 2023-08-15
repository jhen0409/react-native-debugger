import React, { useEffect, useState, useRef } from 'react'
import qs from 'querystring'
import styled from 'styled-components'

const devtoolsHash = 'd9568d04d7dd79269c5a655d7ada69650c5a8336' // Chrome 100

const getDevtoolsURL = (wsURL) =>
  `https://chrome-devtools-frontend.appspot.com/serve_rev/@${devtoolsHash}/devtools_app.html?panel=console&ws=${encodeURIComponent(
    wsURL,
  )}`

const fetchInspectorInfo = async (host = 'localhost', port = 8081) => {
  const list = await fetch(`http://${host}:${port}/json`).then((res) =>
    res.json(),
  )
  if (!list || list.length === 0) return null
  let inspector = list.find((item) =>
    item.title.includes('Improved Chrome Reloads'),
  )
  if (!inspector) inspector = list[list.length - 1] // Use last inspector if none found

  const { description, deviceName, webSocketDebuggerUrl } = inspector

  // parse qs in webSocketDebuggerUrl
  const parsed = qs.parse(webSocketDebuggerUrl.split('?')[1])

  return {
    description,
    deviceName,
    webSocketDebuggerUrl,
    deviceId: parsed.device,
    page: parsed.page,
    devtoolsURL: getDevtoolsURL(webSocketDebuggerUrl.replace('ws://', '')),
  }
}

const noop = () => {}

export default function App() {
  const inspectorInfo = useRef(null)
  const [, setUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      fetchInspectorInfo().then((info) => {
        if (
          !info ||
          info.webSocketDebuggerUrl !== inspectorInfo.current?.webSocketDebuggerUrl
        ) {
          inspectorInfo.current = info
          setUpdate((prev) => prev + 1)
        }
      }).catch(noop)
    }, 5e3)
    return () => clearInterval(interval)
  }, [])

  console.log(inspectorInfo)

  if (!inspectorInfo.current) return null

  return (
    <webview width="100%" height="100%" src={inspectorInfo.current?.devtoolsURL} />
  )
}
