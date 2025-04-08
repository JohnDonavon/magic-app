# Magic App

A React Native app built with Expo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

## Building and Deployment

This project uses Expo EAS (Expo Application Services) for building and deploying to app stores.

### Prerequisites

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your app:
```bash
eas build:configure
```

### Building for Production

To build for iOS:
```bash
eas build --platform ios
```

To build for Android:
```bash
eas build --platform android
```

### GitHub Actions

The project includes GitHub Actions for automated builds. To use it:

1. Add your Expo token as a secret in your GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Add a new secret named `EXPO_TOKEN`
   - Get your token from [Expo's website](https://expo.dev/accounts/[your-username]/settings/access-tokens)

2. Push to the main branch to trigger builds

### App Store Deployment

For TestFlight deployment:
1. Complete the Apple Developer Program setup
2. Configure your app in App Store Connect
3. Submit your build using:
```bash
eas submit -p ios
```

For Google Play deployment:
1. Complete the Google Play Console setup
2. Configure your app in the Play Console
3. Submit your build using:
```bash
eas submit -p android
```