// Metro configuration for Expo/React Native
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('png')) {
  config.resolver.assetExts.push('png');
}

module.exports = config;
