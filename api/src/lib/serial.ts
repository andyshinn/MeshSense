import { SerialPort } from 'serialport'
import { State } from './state'

export interface SerialPortInfo {
  path: string
  name: string
  manufacturer?: string
  serialNumber?: string
  locationId?: string
  vendorId?: string
  productId?: string
}

let serialPortList = new State<SerialPortInfo[]>('serialPortList', [], { primaryKey: 'path', hideLog: true })

let scanning = false

export async function scanSerialPorts(): Promise<SerialPortInfo[]> {
  if (scanning) {
    console.warn('[serial] Already scanning for ports')
    return serialPortList.value
  }

  scanning = true

  try {
    console.log('[serial] Scanning for serial ports...')

    const ports = await SerialPort.list()

    const formattedPorts: SerialPortInfo[] = ports.map(port => ({
      path: port.path,
      name: port.friendlyName || port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      locationId: port.locationId,
      vendorId: port.vendorId,
      productId: port.productId
    }))

    console.log(`[serial] Found ${formattedPorts.length} serial ports`)

    /** Filter out common non-Meshtastic ports to reduce noise */
    const filteredPorts = formattedPorts.filter(port => {
      const pathLower = port.path.toLowerCase()
      const nameLower = port.name.toLowerCase()

      const excludePatterns = [
        'bluetooth',
        'infrared',
        'irda'
      ]

      return !excludePatterns.some(pattern =>
        pathLower.includes(pattern) || nameLower.includes(pattern)
      )
    })

    serialPortList.set(filteredPorts)
    return filteredPorts

  } catch (error) {
    console.error('[serial] Error scanning for ports:', error)
    return []
  } finally {
    scanning = false
  }
}

export function getSerialPorts(): SerialPortInfo[] {
  return serialPortList.value
}

/** Let's do a scan when we load the module */
scanSerialPorts()
