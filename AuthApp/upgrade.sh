#!/bin/bash

# First, remove node_modules and package-lock.json for a clean slate
rm -rf node_modules
rm -f package-lock.json

# Update expo and expo-related packages
npm install expo@52.0.0

# Update specific packages to their correct versions
npm install @expo/metro-config@0.18.11 \
  @react-native-async-storage/async-storage@1.23.1 \
  @react-native-community/datetimepicker@8.0.1 \
  @react-native-community/netinfo@11.3.1 \
  @react-native-picker/picker@2.7.5

# Update other dependencies to compatible versions
npm install react@18.2.0 \
  react-native@0.72.6 \
  expo-constants@~14.4.2 \
  expo-device@~5.4.0 \
  expo-image-picker@~14.3.2 \
  expo-notifications@~0.20.1 \
  expo-status-bar@~1.6.0 \
  react-native-safe-area-context@4.6.3 \
  react-native-screens@~3.22.0

# Clean install
npm install

# Clear metro bundler cache
npx expo start --clear