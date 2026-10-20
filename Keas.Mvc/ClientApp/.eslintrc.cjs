module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  env: { browser: true, es2021: true },
  settings: { react: { version: '17.0' } },
  globals: {
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly'
  },
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off', // TypeScript checks names, including types and browser declarations.
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    // Existing application diagnostics remain visible during this tooling migration.
    'no-extra-boolean-cast': 'warn',
    'no-useless-escape': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/jsx-key': 'warn',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error', { builtinGlobals: false }]
  }
};
