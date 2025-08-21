import { PluginBase } from "@electron-forge/plugin-base"
import type { ForgeMultiHookMap, ResolvedForgeConfig } from "@electron-forge/shared-types"
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs"
import { join } from "path"

export interface CopyNativeBindingsConfig {
  /**
   * Array of package names to copy native bindings from
   */
  packages: string[]
}

export default class CopyNativeBindingsPlugin extends PluginBase<CopyNativeBindingsConfig> {
  public readonly name = "copy-native-bindings"

  constructor(config: CopyNativeBindingsConfig) {
    super(config)
  }

  getHooks = (): ForgeMultiHookMap => {
    return {
      packageAfterCopy: [
        async (
          _forgeConfig: ResolvedForgeConfig,
          buildPath: string,
          _electronVersion: string,
          _platform: string,
          _arch: string,
        ) => {
          for (const packageName of this.config.packages) {
            await this.copyBindingsForPackage(packageName, buildPath)
          }
        },
      ],
    }
  }

  private async copyBindingsForPackage(packageName: string, buildPath: string) {
    // Use require.resolve to find the package root
    const packageJsonPath = require.resolve(`${packageName}/package.json`)
    const packageRoot = join(packageJsonPath, "..")
    const sourcePrebuildsDir = join(packageRoot, "prebuilds")

    if (!existsSync(sourcePrebuildsDir)) {
      throw new Error(`No prebuilds directory found for ${packageName}: ${sourcePrebuildsDir}`)
    }

    // Copy all prebuilds directories to Contents/prebuilds (where apps expect them)
    const prebuildFolders = readdirSync(sourcePrebuildsDir).filter((folder) => {
      const folderPath = join(sourcePrebuildsDir, folder)
      return statSync(folderPath).isDirectory()
    })

    if (prebuildFolders.length === 0) {
      throw new Error(`No prebuilt binding folders found in ${packageName}`)
    }

    for (const folder of prebuildFolders) {
      const sourceFolderPath = join(sourcePrebuildsDir, folder)
      // Copy to Contents/prebuilds instead of Resources/app.asar.unpacked/prebuilds
      const targetFolderPath = join(buildPath, "..", "..", "prebuilds", folder)

      // Create target directory
      mkdirSync(targetFolderPath, { recursive: true })

      // Copy all files in the folder
      const files = readdirSync(sourceFolderPath)
      for (const file of files) {
        const sourceFilePath = join(sourceFolderPath, file)
        const targetFilePath = join(targetFolderPath, file)

        if (statSync(sourceFilePath).isFile()) {
          copyFileSync(sourceFilePath, targetFilePath)
        }
      }
    }
  }
}
