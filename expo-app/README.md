# CORPORA — React Native & Expo Mobile App

CORPORA is a workplace transparency and company intelligence mobile application built with **React Native**, **Expo**, **JavaScript**, **Expo Router**, **React Native StyleSheet**, and **Lucide Icons**.

## Prerequisites
- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator (macOS), Android Emulator, or **Expo Go** on a physical smartphone

## How to Run Locally

```bash
cd expo-app
npm install
npx expo start
```

From the Expo DevTools terminal:
- Press **`i`** to open in the iOS Simulator
- Press **`a`** to open in the Android Emulator
- Press **`w`** to open in Expo Web (`react-native-web`)
- Scan the QR code with **Expo Go** on Android or iOS

## Navigation & Screens
- **Bottom Tabs (`app/(tabs)/_layout.js`)**: Home, Explore, Compare, Community, Profile
- **Company Details (`app/company/[id].js`)**: 7-section organization intelligence view + anonymous review composer
- **Persistence (`src/context/CorporaContext.js`)**: Powered by `@react-native-async-storage/async-storage`
