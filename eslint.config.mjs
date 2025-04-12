import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { ignores: ['node_modules/', 'coverage/', '**/*.spec.ts'] },
  { languageOptions: { globals: globals.browser } },
  { rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended
];
