import { TransportWebBluetooth } from "@meshtastic/transport-web-bluetooth"
import { Bluetooth } from "webbluetooth"
import { createNodeLogger } from "./logging"
import { State } from "./state"

export const bluetoothDevices: Record<string, BluetoothDevice> = {}

const logger = createNodeLogger("bluetooth", "api")
const bluetoothDeviceList = State.create("bluetoothDeviceList", [], { primaryKey: "id", hideLog: true })

let scanning = false
let exitScanning = false
let deviceTargetId = ""
const bluetooth = new Bluetooth({ scanTime: 10 })

/** Loop to show devices consistently */
export async function scanForDevice() {
  if (exitScanning) return

  logger.info("[bluetooth] scanning...")

  try {
    const device: BluetoothDevice | undefined = await bluetooth
      .requestDevice({
        filters: [{ services: [TransportWebBluetooth.ServiceUuid] }],
      })
      .catch((e) => logger.warn(e))

    if (device) {
      logger.info("[bluetooth] Device Detected |", device.id, device.name)
      bluetoothDevices[device.id] = device
      const { id, name } = device
      bluetoothDeviceList.upsert({ id, name })
      if (device.id == deviceTargetId) stopScanning()
    }

    if (!exitScanning) setTimeout(scanForDevice, 500)
  } catch (e) {
    logger.error("[bluetooth], Error encountered during scan", e)
  }
}

export async function beginScanning(targetId?: string) {
  deviceTargetId = targetId
  delete bluetoothDevices[targetId]
  if (scanning) {
    logger.warn("Already Scanning")
    return
  }
  logger.info("[bluetooth] Begin Scanning")

  let adapterAvailable = false

  /** Look for an available bluetooth adapter */
  try {
    adapterAvailable = await bluetooth.getAvailability()
  } catch (e) {
    logger.warn("[bluetooth] Unable to detect Bluetooth adapters")
  }

  logger.info("[bluetooth] Adapter available:", adapterAvailable)
  if (adapterAvailable) {
    scanning = true
    exitScanning = false
    scanForDevice()
  }
}

export function stopScanning() {
  if (scanning) logger.info("[bluetooth] Stop Scanning")
  exitScanning = true
  scanning = false
}
