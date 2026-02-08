module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }]
    ],
    plugins: [
      // react-native-reanimated/plugin musi być ostatni
      // Obsługuje też worklets dla vision-camera
      'react-native-reanimated/plugin',
    ],
  };
};

