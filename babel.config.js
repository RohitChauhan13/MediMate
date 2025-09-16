module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // This must be listed last
    'react-native-reanimated/plugin',
  ],
};
