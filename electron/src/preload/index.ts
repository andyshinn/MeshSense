import { contextBridge, ipcRenderer } from "electron"

// Minimal electron API for renderer
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  },
  process: {
    versions: process.versions,
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
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
