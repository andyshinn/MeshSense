export {}

declare global {
  interface Window {
    api?: {
      onOpenSettings?: (cb: () => void) => void
      onFocusNodeFilter?: (cb: () => void) => void
    }
    electron?: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void
        invoke: (channel: string, ...args: unknown[]) => Promise<any>
      }
      process: {
        versions: NodeJS.ProcessVersions
        env: {
          MESHSENSE_LOG_LEVEL?: string
          NODE_ENV?: string
        }
      }
    }
  }
}
