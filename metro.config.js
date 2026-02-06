const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Dodaj obsługę plików TFLite
config.resolver.assetExts.push('tflite');

module.exports = config;

