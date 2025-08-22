declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void
      }
      process: {
        versions: NodeJS.ProcessVersions
        env: {
          MESHSENSE_LOG_LEVEL?: string
          NODE_ENV?: string
        }
      }
    }
    api: {
      onOpenSettings: (callback: () => void) => void
      onFocusNodeFilter: (callback: () => void) => void
      openSettingsWindow: () => void
    }
  }
}
