import { createLogger } from "api/src/lib/logging"
import { ipcMain, Notification } from "electron"

const logger = createLogger("notifications", "electron", { minLevel: 2 })

interface NotificationSettings {
  enabled: boolean
  silent: boolean
}

interface MessageNotificationData {
  from: number
  fromName: string
  message: string
  channel?: number
  channelName?: string
  isDirect: boolean
}

interface NotificationReply {
  text: string
  messageData: MessageNotificationData
}

let notificationSettings: NotificationSettings = {
  enabled: false,
  silent: false,
}

export function initializeNotifications() {
  logger.info("[notifications] Initializing notification system")

  // Check if notifications are supported
  if (!Notification.isSupported()) {
    logger.warn("[notifications] System notifications are not supported on this platform")
    return
  }

  setupNotificationHandlers()

  // Request current settings from renderer when it's ready
  setTimeout(() => {
    loadNotificationSettings()
  }, 1000)

  logger.info("[notifications] Notification system initialized")
}

function loadNotificationSettings() {
  // This will be called once the renderer is ready to provide settings
  // The renderer will call notification-settings-update with current values
}

function setupNotificationHandlers() {
  // Handle notification settings updates from renderer
  ipcMain.handle("notification-settings-update", (_event, settings: NotificationSettings) => {
    logger.debug("[notifications] Settings updated:", settings)
    notificationSettings = { ...settings }
    return true
  })

  // Handle notification requests from API
  ipcMain.handle("show-message-notification", (_event, data: MessageNotificationData) => {
    if (!notificationSettings.enabled) {
      logger.debug("[notifications] Notifications disabled, skipping")
      return false
    }

    return showMessageNotification(data)
  })

  // Handle getting current settings
  ipcMain.handle("get-notification-settings", () => {
    return notificationSettings
  })
}

export function showMessageNotification(data: MessageNotificationData): boolean {
  logger.info(`[notifications] showMessageNotification called for ${data.fromName}`)
  logger.debug(
    `[notifications] Settings: enabled=${notificationSettings.enabled}, silent=${notificationSettings.silent}`,
  )

  if (!notificationSettings.enabled) {
    logger.debug("[notifications] Notifications disabled, skipping")
    return false
  }

  try {
    const title = data.isDirect ? `Direct message from ${data.fromName}` : `Message in ${data.channelName || "channel"}`

    const body = data.message.length > 100 ? `${data.message.substring(0, 97)}...` : data.message

    logger.debug(`[notifications] Creating notification: "${title}" - "${body}"`)

    const notification = new Notification({
      title,
      body,
      silent: notificationSettings.silent,
      hasReply: true,
      replyPlaceholder: "Type your reply...",
      urgency: "normal",
    })

    logger.debug("[notifications] Notification object created, setting up event handlers")

    // Handle notification click
    notification.on("click", () => {
      logger.debug("[notifications] Notification clicked")
      // Focus the main window if needed
    })

    // Handle notification reply (macOS feature)
    notification.on("reply", (_event, reply: string) => {
      logger.info("[notifications] Reply received from notification:", reply)
      handleNotificationReply({ text: reply, messageData: data })
    })

    // Handle notification close
    notification.on("close", () => {
      logger.debug("[notifications] Notification closed")
    })

    logger.debug("[notifications] About to show notification")
    notification.show()
    logger.info(`[notifications] Successfully showed notification for message from ${data.fromName}`)
    return true
  } catch (error) {
    logger.error("[notifications] Failed to show notification:", error)
    return false
  }
}

function handleNotificationReply(reply: NotificationReply) {
  const { text, messageData } = reply

  logger.info(`[notifications] Processing reply: "${text}" for message from ${messageData.fromName}`)

  // Send IPC message to API process with reply data
  const replyData = {
    message: text,
    to: messageData.from,
    channel: messageData.isDirect ? undefined : messageData.channel,
    isDirect: messageData.isDirect,
  }

  logger.debug("[notifications] Reply data to send:", replyData)

  // Forward reply to API process for sending
  // This will be handled by the API process message sending logic
  if (process.send) {
    logger.info("[notifications] Sending reply to API process via process.send")
    process.send({
      event: "notification-reply",
      body: replyData,
    })
  } else {
    logger.error("[notifications] No process.send available - cannot send reply")
  }
}

export function updateNotificationSettings(settings: NotificationSettings) {
  notificationSettings = { ...settings }
  logger.debug("[notifications] Settings updated externally:", settings)
}

export function getNotificationSettings(): NotificationSettings {
  return { ...notificationSettings }
}
