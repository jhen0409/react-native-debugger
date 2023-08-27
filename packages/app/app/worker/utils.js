/* eslint-disable no-underscore-dangle */

// Avoid warning of use metro require on dev mode
// it actually unnecessary for RN >= 0.56, so it is backward compatibility
const avoidWarnForRequire = (moduleNames) => {
  if (!moduleNames.length) moduleNames.push('NativeModules')
  return new Promise((resolve) => {
    setTimeout(() => {
      // It's replaced console.warn of react-native
      const originalWarn = console.warn
      console.warn = (...args) => {
        if (
          args[0]
            && moduleNames.some(
              (name) => args[0].indexOf(`Requiring module '${name}' by name`) > -1,
            )
        ) {
          return
        }
        return originalWarn(...args)
      }
      resolve(() => {
        console.warn = originalWarn
      })
    })
  })
}

let reactNative

const getRequireMethod = () => {
  // RN >= 0.57
  if (typeof window.__r === 'function') return window.__r
  // RN < 0.57
  if (typeof window.require === 'function') return window.require
}

const lookupForRNModules = (size = 999) => {
  const metroRequire = getRequireMethod()
  let actualSize = size
  let getModule = metroRequire
  if (metroRequire.getModules) {
    const mods = metroRequire.getModules()
    actualSize = Object.keys(mods).length
    getModule = (moduleId) => {
      const mod = mods && mods[moduleId]
      return (mod && mod.publicModule && mod.publicModule.exports) || null
    }
  } else {
    getModule = (moduleId) => metroRequire(moduleId)
  }
  for (let moduleId = 0; moduleId <= actualSize - 1; moduleId += 1) {
    const rn = getModule(moduleId)
    if (rn && rn.requireNativeComponent && rn.NativeModules) {
      return rn
    }
  }
  return null
}

const getModule = (name, size) => {
  let result
  try {
    const metroRequire = getRequireMethod()
    // RN >= 0.56
    if (metroRequire.name === 'metroRequire') {
      const rn = reactNative || lookupForRNModules(size)
      reactNative = rn
      global.$reactNative = rn
      result = reactNative && reactNative[name]
    } else if (metroRequire.name === '_require') {
      result = metroRequire(name)
    }
  } catch (e) {} // eslint-disable-line
  return result || { __empty: true }
}

const requiredModules = {
  MessageQueue: (size) => (self.__fbBatchedBridge
      && Object.getPrototypeOf(self.__fbBatchedBridge).constructor)
    || getModule('MessageQueue', size),
  NativeModules: (size) => getModule('NativeModules', size),
  Platform: (size) => getModule('Platform', size),
  setupDevtools: (size) => getModule('setupDevtools', size),
}

export const getRequiredModules = async (size) => {
  if (!window.__DEV__ || !getRequireMethod()) return
  const done = await avoidWarnForRequire(Object.keys(requiredModules))
  const modules = {}
  Object.keys(requiredModules).forEach((name) => {
    modules[name] = requiredModules[name](size)
  })
  done()
  return modules
}

const RN_DEBUGGER_URL_PART = 'RNDebuggerWorker.js'
const BUNDLE_URL_REGEXP = /(http[\S]*?index\.bundle\?[\S]*?)(:\d+:?\d?)/

const addInlineSourceMap = (_, urlGroup1, urlGroup2) => `${urlGroup1}&inlineSourceMap=true${urlGroup2}`
const mapStackLines = (line) => line.replace(BUNDLE_URL_REGEXP, addInlineSourceMap)
const filterRnDebuggerLines = (line) => !line.includes(RN_DEBUGGER_URL_PART)

export function updateStackWithSourceMap(stack) {
  const lines = stack.split('\n')
  const linesWithoutRNDebugger = lines.filter(filterRnDebuggerLines)
  const lineWithSourceMap = linesWithoutRNDebugger.map(mapStackLines)
  return lineWithSourceMap.join('\n')
}
