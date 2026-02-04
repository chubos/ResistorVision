module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }]
    ],
    plugins: [
      // 'react-native-worklets/plugin', // Tymczasowo wyłączone - powoduje problemy z uruchomieniem
      'react-native-reanimated/plugin',
    ],
  };
};

