import { FuseV1Options, FuseVersion } from "@electron/fuses"
import { MakerDeb } from "@electron-forge/maker-deb"
import { MakerDMG } from "@electron-forge/maker-dmg"
import { MakerRpm } from "@electron-forge/maker-rpm"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives"
import { FusesPlugin } from "@electron-forge/plugin-fuses"
import { VitePlugin } from "@electron-forge/plugin-vite"
import type { ForgeConfig } from "@electron-forge/shared-types"
import * as pjson from "./package.json"
import CopyNativeBindingsPlugin from "./plugins/copy-native-bindings"

const channel = pjson.version.match(/-(?<channel>\w*).*/)?.groups?.channel
const channelString = channel ? `-${channel}` : ""

const winSigningOptions = {
  signingHashAlgorithms: ["sha256"] as const,
  publisherName: ["Affirmatech Inc.", "Affirmatech Incorporated"],
  signAndEditExecutable: true,
  verifyUpdateCodeSignature: true,
  certificateSubjectName: "Affirmatech Incorporated",
}

const enableWinSigning = !!(process.env.ENABLE_WIN_SIGNING && process.env.ENABLE_WIN_SIGNING.toLowerCase() === "true")
const hasNotarizeEnvVars = !!(process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID && process.env.APPLE_API_ISSUER)

function getIconPath() {
  if (process.platform === "darwin") {
    return "build/meshsense-regular-adaptive.icns"
  } else if (process.platform === "win32") {
    return "build/icon.ico"
  } else {
    return "build/icon.png"
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    name: "MeshSense",
    asar: true,
    appBundleId: "com.affirmatech.meshsense",
    icon: getIconPath(),
    extraResource: ["resources/api"],
    osxSign: {},
    ...(hasNotarizeEnvVars && {
      osxNotarize: {
        appleApiKey: process.env.APPLE_API_KEY,
        appleApiKeyId: process.env.APPLE_API_KEY_ID,
        appleApiIssuer: process.env.APPLE_API_ISSUER,
      },
    }),
    osxUniversal: {
      mergeASARs: true,
      singleArchFiles: "Contents/Resources/app/node_modules/**/*.node",
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel(
      {
        name: "meshsense",
        setupExe: `MeshSense${channelString}-{{arch}}-Setup.{{ext}}`,
        iconUrl: "https://affirmatech.com/favicon.ico",
        setupIcon: "build/icon.ico",
        noMsi: true,
        ...(enableWinSigning ? winSigningOptions : {}),
      },
      ["win32"],
    ),
    new MakerZIP({}, ["darwin"]),
    new MakerDMG(
      {
        icon: "build/meshsense-regular-adaptive.icns",
      },
      ["darwin"],
    ),
    new MakerDeb(
      {
        options: {
          bin: "meshsense",
          name: "meshsense",
          productName: "MeshSense",
          genericName: "MeshSense",
          description:
            "MeshSense is a simple, open-source application that monitors, maps and graphically displays all the vital stats of your area's Meshtastic network",
          version: pjson.version,
          section: "utils",
          priority: "optional",
          categories: ["Utility"],
          homepage: "https://affirmatech.com",
          icon: "build/icon.png",
        },
      },
      ["linux"],
    ),
    new MakerRpm(
      {
        options: {
          bin: "meshsense",
          name: "meshsense",
          productName: "MeshSense",
          genericName: "MeshSense",
          description:
            "MeshSense is a simple, open-source application that monitors, maps and graphically displays all the vital stats of your area's Meshtastic network",
          version: pjson.version,
          license: "ISC",
          homepage: "https://affirmatech.com",
          categories: ["Utility"],
          icon: "build/icon.png",
        },
      },
      ["linux"],
    ),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new CopyNativeBindingsPlugin({
      packages: ["webbluetooth"],
    }),
    new VitePlugin({
      build: [
        {
          entry: "src/main/index.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload/index.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
