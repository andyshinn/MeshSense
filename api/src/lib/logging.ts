import { Logger } from "tslog"

/**
 * Centralized logging configuration for MeshSense UI
 *
 * Usage:
 * 1. For Node.js contexts: import { createNodeLogger } from './lib/logging'
 * 2. Create logger instance: const logger = createNodeLogger('my-module', 'workspace')
 * 3. For custom config: import { createLogger } from './lib/logging' and pass config
 * 4. Use logger: logger.info('Message'), logger.warn('Warning'), etc.
 *
 * Features:
 * - Automatic configuration logging when module is first imported
 * - Hierarchical logger names (logging:module-name)
 * - No manual setup required - just import and use
 *
 * Environment Configuration:
 * Set MESHSENSE_LOG_LEVEL to control minimum log level:
 * - MESHSENSE_LOG_LEVEL=silly   (shows all logs)
 * - MESHSENSE_LOG_LEVEL=trace
 * - MESHSENSE_LOG_LEVEL=debug
 * - MESHSENSE_LOG_LEVEL=info    (default)
 * - MESHSENSE_LOG_LEVEL=warn
 * - MESHSENSE_LOG_LEVEL=error
 * - MESHSENSE_LOG_LEVEL=fatal   (shows only fatal errors)
 *
 * Available log levels (from tslog):
 * 0: silly
 * 1: trace
 * 2: debug
 * 3: info
 * 4: warn
 * 5: error
 * 6: fatal
 */
const LOG_LEVELS = {
  silly: 0,
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  fatal: 6,
} as const

type LogLevel = keyof typeof LOG_LEVELS

/**
 * Parse log level string to numeric value
 */
function parseLogLevel(levelStr: string | undefined): number {
  if (!levelStr) {
    return LOG_LEVELS.info
  }

  const envLevel = levelStr.toLowerCase() as LogLevel
  if (envLevel && envLevel in LOG_LEVELS) {
    return LOG_LEVELS[envLevel]
  }

  // Default to 'info' level (3) if invalid
  return LOG_LEVELS.info
}

/**
 * Configuration options for logger creation
 */
interface LoggerConfig {
  minLevel?: number
  isProduction?: boolean
}

let baseLogger: Logger<any> | null = null

/**
 * Create a logger instance with consistent configuration and specified name
 * @param name - The logger name (will be prefixed with workspace if provided)
 * @param workspace - Optional workspace prefix ('api', 'electron', etc.)
 * @param config - Optional configuration for logger
 */
export function createLogger(name: string, workspace?: string, config?: LoggerConfig): Logger<any> {
  // Initialize base logger if not already created
  if (!baseLogger) {
    const loggerConfig = {
      minLevel: config?.minLevel ?? LOG_LEVELS.info,
      hideLogPositionForProduction: config?.isProduction ?? false,
      prettyLogTemplate: "{{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t",
    }

    baseLogger = new Logger({
      ...loggerConfig,
      name: "meshsense",
    })

    // Log the current configuration on first logger creation
    const levelName =
      Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key as LogLevel] === loggerConfig.minLevel) || "info"
    baseLogger.info(`Logger initialized with minLevel: ${levelName}`)
  }

  const loggerName = workspace ? `${workspace}:${name}` : name
  return baseLogger.getSubLogger({ name: loggerName })
}

/**
 * Helper function to create logger with environment-based configuration for Node.js contexts
 * @param name - The logger name
 * @param workspace - Optional workspace prefix
 * @returns Logger instance configured from process.env
 */
export function createNodeLogger(name: string, workspace?: string): Logger<any> {
  const minLevel = parseLogLevel(process.env.MESHSENSE_LOG_LEVEL)
  const isProduction = process.env.NODE_ENV === "production"

  return createLogger(name, workspace, { minLevel, isProduction })
}

// Export available log levels and types for reference
export { LOG_LEVELS, parseLogLevel }
export type { LogLevel, LoggerConfig }
