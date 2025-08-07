import { SerialPort } from 'serialport'

class SerialPortWrapper {
  private nodePort: SerialPort | null = null
  private _readable: ReadableStream<Uint8Array> | null = null
  private _writable: WritableStream<Uint8Array> | null = null
  private _readableController: ReadableStreamDefaultController<Uint8Array> | null = null
  private _writableController: WritableStreamDefaultController | null = null

  constructor(private portPath: string) {}

  getInfo() {
    return {
      path: this.portPath,
      usbProductId: undefined,
      usbVendorId: undefined
    }
  }

  async open(options: { baudRate?: number; dataBits?: number; stopBits?: number; parity?: string; flowControl?: string }): Promise<void> {
    const baudRate = options.baudRate || 115200

    // Force cleanup first
    await this.forceCleanup()

    return new Promise((resolve, reject) => {
      this.nodePort = new SerialPort({
        path: this.portPath,
        baudRate,
        autoOpen: false
      })

      this.nodePort.open((error) => {
        if (error) {
          reject(new Error(`Failed to open serial port ${this.portPath}: ${error.message}`))
          return
        }
        resolve()
      })
    })
  }

  private async forceCleanup(): Promise<void> {
    // Force close any existing streams
    if (this._readableController) {
      try {
        if (this._readableController.desiredSize !== null) {
          this._readableController.close()
        }
      } catch (e) { /* ignore */ }
      this._readableController = null
    }

    if (this._writableController) {
      try {
        // WritableStreamDefaultController doesn't have a state check, so just try/catch
        this._writableController.error(new Error('Stream being reset'))
      } catch (e) { /* ignore */ }
      this._writableController = null
    }

    // Reset streams
    this._readable = null
    this._writable = null

    // Close existing port if open
    if (this.nodePort) {
      try {
        if (this.nodePort.isOpen) {
          await new Promise<void>((resolve) => {
            this.nodePort!.close((error) => {
              if (error) {
                console.warn(`Error closing port during cleanup: ${error.message}`)
              }
              resolve()
            })
          })
        }
      } catch (e) {
        console.warn('Error during port cleanup:', e)
      }
      this.nodePort = null
    }
  }

  async close(): Promise<void> {
    if (!this.nodePort) return

    console.log(`[SerialPortWrapper] Closing port ${this.portPath}`)

    // Force abort streams before closing
    try {
      if (this._readable) {
        // Try to cancel the readable stream
        try {
          const reader = this._readable.getReader()
          await reader.cancel()
          reader.releaseLock()
        } catch (e) {
          // Stream may already be locked or closed
        }
        this._readable = null
      }
    } catch (e) {
      console.warn('[SerialPortWrapper] Error closing readable stream:', e)
    }

    try {
      if (this._writable) {
        // Try to abort the writable stream
        try {
          await this._writable.abort()
        } catch (e) {
          // Stream may already be closed
        }
        this._writable = null
      }
    } catch (e) {
      console.warn('[SerialPortWrapper] Error closing writable stream:', e)
    }

    // Reset controllers
    this._readableController = null
    this._writableController = null

    return new Promise((resolve) => {
      this.nodePort!.close((error) => {
        if (error) {
          console.warn(`Error closing port: ${error.message}`)
        }
        this.nodePort = null
        console.log(`[SerialPortWrapper] Port ${this.portPath} closed successfully`)
        resolve()
      })
    })
  }

  get readable(): ReadableStream<Uint8Array> {
    // Check if current stream is closed and recreate if needed
    if (this._readable) {
      try {
        // Try to get a reader to test if stream is still readable
        const reader = this._readable.getReader()
        reader.releaseLock()
      } catch (e) {
        // Stream is closed, reset it
        this._readable = null
        this._readableController = null
      }
    }

    if (!this._readable && this.nodePort && this.nodePort.isOpen) {
      this._readable = new ReadableStream({
        start: (controller) => {
          this._readableController = controller
          
          this.nodePort!.on('data', (data: Buffer) => {
            if (controller.desiredSize !== null) {
              controller.enqueue(new Uint8Array(data))
            }
          })

          this.nodePort!.on('error', (error: Error) => {
            if (controller.desiredSize !== null) {
              controller.error(error)
            }
          })

          this.nodePort!.on('close', () => {
            try {
              if (controller.desiredSize !== null) {
                controller.close()
              }
            } catch (e) {
              // Controller may already be closed
            }
            this._readableController = null
          })
        },
        cancel: async () => {
          this._readableController = null
          await this.close()
        }
      })
    }
    return this._readable!
  }

  get writable(): WritableStream<Uint8Array> {
    // Check if current stream is closed and recreate if needed
    if (this._writable) {
      try {
        // Try to get a writer to test if stream is still writable
        const writer = this._writable.getWriter()
        writer.releaseLock()
      } catch (e) {
        // Stream is closed, reset it
        this._writable = null
        this._writableController = null
      }
    }

    if (!this._writable && this.nodePort && this.nodePort.isOpen) {
      this._writable = new WritableStream({
        start: (controller) => {
          this._writableController = controller
        },
        write: async (chunk: Uint8Array) => {
          return new Promise((resolve, reject) => {
            if (!this.nodePort || !this.nodePort.isOpen) {
              reject(new Error('Serial port is not open'))
              return
            }

            this.nodePort.write(Buffer.from(chunk), (error) => {
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            })
          })
        },
        close: async () => {
          this._writableController = null
          await this.close()
        },
        abort: async () => {
          this._writableController = null
          await this.close()
        }
      })
    }
    return this._writable!
  }

  async setSignals(signals: { dataTerminalReady?: boolean; requestToSend?: boolean; break?: boolean }): Promise<void> {
    if (!this.nodePort) throw new Error('Port not open')

    return new Promise((resolve, reject) => {
      this.nodePort!.set({
        dtr: signals.dataTerminalReady,
        rts: signals.requestToSend,
        brk: signals.break
      }, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  async getSignals(): Promise<{ clearToSend: boolean; dataSetReady: boolean; dataCarrierDetect: boolean }> {
    if (!this.nodePort) throw new Error('Port not open')

    return new Promise((resolve, reject) => {
      this.nodePort!.get((error, status) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            clearToSend: status?.cts || false,
            dataSetReady: status?.dsr || false,
            dataCarrierDetect: status?.dcd || false
          })
        }
      })
    })
  }
}

class NavigatorSerialPolyfill {
  private openPorts: Map<string, SerialPortWrapper> = new Map()

  async requestPort(): Promise<SerialPortWrapper> {
    throw new Error('requestPort() is not supported in Node.js environment')
  }

  async getPorts(): Promise<SerialPortWrapper[]> {
    const ports = await SerialPort.list()
    return ports.map(port => new SerialPortWrapper(port.path))
  }

  createPortFromPath(portPath: string): SerialPortWrapper {
    // Close any existing port at this path first
    const existing = this.openPorts.get(portPath)
    if (existing) {
      try {
        existing.close()
      } catch (e) {
        // Ignore errors from closing existing port
      }
    }

    const wrapper = new SerialPortWrapper(portPath)
    this.openPorts.set(portPath, wrapper)
    return wrapper
  }

  async closeAllPorts(): Promise<void> {
    const closePromises = Array.from(this.openPorts.values()).map(port => 
      port.close().catch(() => {}) // Ignore individual close errors
    )
    await Promise.all(closePromises)
    this.openPorts.clear()
  }
}

declare global {
  interface Navigator {
    serial: NavigatorSerialPolyfill
  }
}

if (typeof global !== 'undefined' && !(global as any).navigator) {
  (global as any).navigator = {}
}

if (typeof global !== 'undefined' && !(global as any).navigator.serial) {
  (global as any).navigator.serial = new NavigatorSerialPolyfill()
}

export { SerialPortWrapper, NavigatorSerialPolyfill }
