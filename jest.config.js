export default {
  preset: 'ts-jest/presets/js-with-babel-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
