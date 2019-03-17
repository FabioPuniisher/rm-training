module.exports = {
  parser: "babel-eslint",
  "extends": ["eslint:recommended", "google"],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': ["off", "windows"],
  },
  env: {
    "browser": true,
  }
}
