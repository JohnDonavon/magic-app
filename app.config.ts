import { ExpoConfig, ConfigContext } from 'expo/config';

const VersionName = '0.0.1'; // Set your app version here
const VersionCode = 1;       // Set your build version here

const APP_VARIANT = process.env.APP_VARIANT || 'development';

let AppName = 'Magic App';
let AppId = 'com.magicapp';

switch (APP_VARIANT) {
  case 'development':
    AppName = 'Magic App Dev';
    AppId = 'com.magicapp.dev';
    break;
  case 'staging':
    AppName = 'Magic App Staging';
    AppId = 'com.magicapp.staging';
    break;
  case 'production':
    break;
  default:
    throw new Error(`Unknown APP_VARIANT: ${APP_VARIANT}`);
}

export default ({ config: expoConfig }: ConfigContext): ExpoConfig => ({
  ...expoConfig,
  name: AppName,
  slug: 'mtg-overseer',
  version: VersionName,
  scheme: 'magic-app',
  orientation: 'portrait',
  icon: './assets/icon.png', // Update path as needed
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png', // Update path as needed
    resizeMode: 'contain',
    backgroundColor: '#634CFF',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    buildNumber: String(VersionCode),
    supportsTablet: true,
    bundleIdentifier: AppId,
    infoPlist: {
      NSCameraUsageDescription: 'Allow Magic App to use the camera for scanning cards.',
      NSPhotoLibraryUsageDescription: 'Allow Magic App to access your photo library to save card images.',
    },
  },
  android: {
    allowBackup: false,
    adaptiveIcon: {
      backgroundColor: '#634CFF',
      foregroundImage: './assets/adaptive-icon.png', // Update path as needed
    },
    package: AppId,
    versionCode: VersionCode,
    softwareKeyboardLayoutMode: 'pan',
  },
  web: {
    favicon: './assets/favicon.png', // Update path as needed
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    // Add plugins here as needed, e.g. 'expo-localization', etc.
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '7ff5ef6c-693d-4fc4-addb-fb62cb324b3a',
    },
  },
  owner: 'johndonavon',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/7ff5ef6c-693d-4fc4-addb-fb62cb324b3a',
  },
}); 