import { getCurrentWindow } from '@electron/remote'

export default getCurrentWindow().debuggerConfig || {}
