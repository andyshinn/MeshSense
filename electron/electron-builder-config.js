var pjson = require('./package.json')
const channel = pjson.version.match(/-(?<channel>\w*).*/)?.groups?.channel
const channelString = channel ? `-${channel}` : ''

const winSigningOptions = {
  signingHashAlgorithms: ['sha256'],
  publisherName: ['Affirmatech Inc.', 'Affirmatech Incorporated'],
  signAndEditExecutable: true,
  verifyUpdateCodeSignature: true,
  certificateSubjectName: 'Affirmatech Incorporated'
};

const enableWinSigning = process.env.ENABLE_WIN_SIGNING === 'true';

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.affirmatech.meshsense',
  productName: 'MeshSense',
  generateUpdatesFilesForAllChannels: true,
  directories: {
    buildResources: 'build'
  },
  asar: true,
  asarUnpack: [
    'resources/**',
    'prebuilds/**',
  ],
  win: {
    artifactName: `\${name}${channelString}-\${arch}.\${ext}`,
    executableName: 'MeshSense',
    signAndEditExecutable: true,
    verifyUpdateCodeSignature: true,
    signtoolOptions: enableWinSigning ? winSigningOptions : undefined,
  },
  nsis: {
    artifactName: `\${name}${channelString}-\${arch}.\${ext}`,
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: true
  },
  mac: {
    artifactName: `\${name}${channelString}-\${arch}.\${ext}`,
    icon: 'build/meshsense-regular-adaptive.icns',
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: [
      {
        NSDocumentsFolderUsageDescription: "Application requests access to the user's Documents folder."
      }
    ],
    target: [
      {
        target: 'dmg',
        arch: ['universal'],
      }
    ],
    singleArchFiles: "Contents/Resources/app/node_modules/**/*.node",
  },
  dmg: {
    artifactName: `\${name}${channelString}-\${arch}.\${ext}`
  },
  linux: {
    target: ['AppImage'],
    maintainer: 'electronjs.org',
    category: 'Utility',
    icon: 'build/icon.png'
  },
  appImage: {
    artifactName: `\${name}${channelString}-\${arch}.\${ext}`
  },
  publish: {
    provider: 'generic',
    url: 'https://affirmatech.com/download/meshsense'
  }
}
module.exports = config
