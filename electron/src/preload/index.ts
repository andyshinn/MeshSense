import { contextBridge, ipcRenderer } from "electron"

// Minimal electron API for renderer
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args), // returns Promise for two-way communication
  },
  process: {
    versions: process.versions,
    env: {
      MESHSENSE_LOG_LEVEL: process.env.MESHSENSE_LOG_LEVEL,
      NODE_ENV: process.env.NODE_ENV,
    },
  },
}

// Custom APIs for renderer
const api = {
  onOpenSettings: (callback: () => void) => {
    ipcRenderer.on("open-settings", callback)
  },
  onFocusNodeFilter: (callback: () => void) => {
    ipcRenderer.on("focus-node-filter", callback)
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("api", api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
