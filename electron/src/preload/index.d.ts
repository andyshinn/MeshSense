declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void
      }
      process: {
        versions: NodeJS.ProcessVersions
      }
    }
    api: {
      onOpenSettings: (callback: () => void) => void
      onFocusNodeFilter: (callback: () => void) => void
    }
  }
}
