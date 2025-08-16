import envPaths from "env-paths"
import { existsSync, fstat, mkdirSync } from "fs"
import { dirname, join, sep } from "path"
import url from "url"
import { createNodeLogger } from "./logging"

const logger = createNodeLogger("paths", "api")
const userPaths = envPaths("meshsense", { suffix: "" })
const __filename = url.fileURLToPath(import.meta.url)

/** When in development, return the base `api` directory */

export const programDirectory = dirname(__filename).replace(`api${sep}src${sep}lib`, `api`)
export const staticDirectory = join(programDirectory, "static")
export const dataDirectory = userPaths.data

if (!existsSync(dataDirectory)) {
  mkdirSync(dataDirectory, { recursive: true })
}

logger.info({ programDirectory, staticDirectory, dataDirectory })
