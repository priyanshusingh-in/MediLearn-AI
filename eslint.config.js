import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    plugins: {
      next: nextPlugin
    },
    extends: [
      'eslint:recommended',
      'plugin:next/recommended',
      'plugin:next/core-web-vitals'
    ],
    rules: {
      // Add any custom rules here
    }
  }
]; 