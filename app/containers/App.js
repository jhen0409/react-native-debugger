import React, { useEffect, useState, useRef } from 'react'
import qs from 'querystring'
import styled from 'styled-components'
import {
  catchConsoleLogLink,
  removeUnecessaryTabs,
} from '../utils/devtools'

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
      fetchInspectorInfo()
        .then((info) => {
          if (
            !info ||
            info.webSocketDebuggerUrl !==
              inspectorInfo.current?.webSocketDebuggerUrl
          ) {
            inspectorInfo.current = info
            setUpdate((prev) => prev + 1)
          }
        })
        .catch(noop)
    }, 5e3)
    return () => clearInterval(interval)
  }, [])

  console.log(inspectorInfo)

  const webview = useRef(null)

  if (!inspectorInfo.current) return null

  return (
    <webview
      ref={(ref) => {
        webview.current = ref
        if (ref) {
          ref.addEventListener('dom-ready', () => {
            const view = webview.current
            const devtools = { devToolsWebContents: view }

            let interval
            const waitReady = () => {
              const requestId = view.findInPage('Console')

              const listener = (e) => {
                if (e.result.matches > 0 && e.result.requestId === requestId) {
                  view.stopFindInPage('keepSelection')

                  catchConsoleLogLink(devtools, 'localhost', 8081) // TODO
                  // TODO: if (config.showAllDevToolsTab !== true)
                  removeUnecessaryTabs(devtools)

                  clearInterval(interval)
                  view.removeEventListener('found-in-page', listener)
                }
              }

              view.addEventListener('found-in-page', listener)
            }

            interval = setInterval(waitReady, 500)
            waitReady()
          })
        }
      }}
      style={{ minHeight: 500, width: '100%' }}
      autosize="on"
      src={inspectorInfo.current?.devtoolsURL}
    />
  )
}
