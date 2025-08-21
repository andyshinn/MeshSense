import type { Protobuf } from "@meshtastic/core"
import { State } from "./lib/state"

export const version = State.create("version", "")
export const headless = State.create("headless", "")
export const address = State.create("address", "", { persist: "api" })
export const connectionStatus = State.create<
  "connected" | "connecting" | "disconnected" | "searching" | "configuring" | "reconnecting"
>("connectionStatus", "disconnected")
export const lastFromRadio = State.create("lastFromRadio", undefined, { hideLog: true })
export const channels = State.create<Channel[]>("channels", [], { primaryKey: "index", hideLog: true })
export const packets = State.create<MeshPacket[]>("packets", [], { hideLog: true })
export const nodes = State.create<NodeInfo[]>("nodes", [], { primaryKey: "num", hideLog: true })
export const currentTime = State.create<number>("currentTime", Date.now(), { hideLog: true })
export const myNodeNum = State.create<number>("myNodeNum")
export const broadcastId = 4294967295
export const myNodeMetadata = State.create<DeviceMetadata>("myNodeMetadata")
export const accessKey = State.create<string>("accessKey", undefined, { persist: true, hideLog: true })
export const packetLimit = State.create<number>("packetLimit", 500, { persist: true })
export const apiHostname = State.create<string>("apiHostname", undefined, { hideLog: true })
export const apiPort = State.create<string>("apiPort", undefined, { hideLog: true })
export const messagePrefix = State.create<string>("messagePrefix", undefined, { persist: true })
export const messageSuffix = State.create<string>("messageSuffix", undefined, { persist: true })
export const allowRemoteMessaging = State.create<boolean>("allowRemoteMessaging", false, { persist: true })
export const autoConnectOnStartup = State.create<boolean>("autoConnectOnStartup", true, { persist: true })
export const enableTLS = State.create<boolean>("enableTLS", false, { persist: true })
export const automaticTraceroutes = State.create<boolean>("automaticTraceroutes", true, { persist: true })
export const meshSenseNewsDate = State.create<number>("meshSenseNewsDate", 0, { persist: true })
export const pendingTraceroutes = State.create<number[]>("pendingTraceroutes", [], { hideLog: true })
export const meshMapForwarding = State.create<boolean>("meshMapForwarding", false, { hideLog: true, persist: true })

/** Measured in minutes */
export const tracerouteRateLimit = State.create<number>("tracerouteRateLimit", 60, { persist: true })
export const nodeInactiveTimer = State.create<number>("nodeInactiveTimer", 60, { persist: true })

export type DeviceMetadata = {
  firmwareVersion: string
  deviceStateVersion: number
  canShutdown: boolean
  hasWifi: boolean
  hasBluetooth: boolean
  hasEthernet: boolean
  role: string
  positionFlags: number
  hwModel: string
  hasRemoteHardware: boolean
}

export type Message = {
  id: number
  rxTime: string
  type: string
  from: number
  to: number
  channel: number
  data: string
  show?: boolean
  decoded?: string
  readable?: string
}

export type User = {
  id: string
  longName: string
  shortName: string
  macaddr: string
  hwModel: string
  isLicensed: boolean
  role: number
}

export type Position = {
  latitudeI: number
  longitudeI: number
  altitude: number
  time: number
  locationSource: number
  altitudeSource: number
  timestamp: number
  timestampMillisAdjust: number
  altitudeHae: number
  altitudeGeoidalSeparation: number
  PDOP: number
  HDOP: number
  VDOP: number
  gpsAccuracy: number
  groundSpeed: number
  groundTrack: number
  fixQuality: number
  fixType: number
  satsInView: number
  sensorId: number
  nextUpdate: number
  seqNumber: number
  precisionBits: number
}

export type DeviceMetrics = {
  batteryLevel: number
  voltage: number
  channelUtilization: number
  airUtilTx: number
  uptimeSeconds?: number
}

export type EnvironmentMetrics = {
  temperature: number
  relativeHumidity: number
  barometricPressure: number
  gasResistance: number
  iaq: number
}

export type NodeInfo = {
  num: number
  snr: number
  lastHeard: number
  channel: number
  viaMqtt: boolean
  hopsAway: number
  isFavorite: boolean
  user: User
  position: Position
  deviceMetrics?: DeviceMetrics
  environmentMetrics?: EnvironmentMetrics
  rssi?: number
  trace?: Protobuf.Mesh.RouteDiscovery
  approximatePosition?: { longitude: number; latitude: number } | false
}

export type ChannelSettings = {
  channelNum: number
  psk: string
  name: string
  id: number
  uplinkEnabled: boolean
  downlinkEnabled: boolean
  moduleSettings: { positionPrecision?: number }
}

export type Channel = {
  index: number
  role: 0 | 1 | 2
  settings: ChannelSettings
}

export type MeshPacket = {
  from: number
  to: number
  channel: number
  encrypted?: string
  decoded?: Protobuf.Data
  payloadVariant?: { case: string; value: unknown }
  // {
  // case: 'decoded',
  // value: Data {
  //   portnum: 1,
  //   payload: [Uint8Array],
  //   wantResponse: false,
  //   dest: 0,
  //   source: 0,
  //   requestId: 0,
  //   replyId: 0,
  //   emoji: 0
  // }
  id: number
  rxTime: number
  rxSnr: number
  hopLimit: number
  wantAck: boolean
  priority: Protobuf.Mesh.MeshPacket_Priority
  rxRssi: number
  delayed: Protobuf.Mesh.MeshPacket_Delayed
  viaMqtt: boolean
  hopStart: number
  publicKey?: string
  pkiEncrypted?: boolean
  data?: Protobuf.Data
  message?: Message
  deviceMetrics?: DeviceMetrics
  environmentMetrics?: EnvironmentMetrics
  position?: Position
  user?: User
  detectionSensor?: string
  trace?: {
    route: number[]
  }
  routing?: {
    errorReason: string
  }
  neighbors?: {
    nodeId: number
    snr: number
    lastRxTime: number
    nodeBroadcastIntervalSecs: number
  }[]
}
