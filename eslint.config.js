import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts,svelte}'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.svelte']
      }
    },
    plugins: {
      '@typescript-eslint': ts,
      svelte
    },
    rules: {
      ...ts.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error'
    }
  },
  {
    files: ['**/*.svelte'],
    ...svelte.configs.recommended,
    languageOptions: {
      parser: svelte.parser,
      parserOptions: {
        parser: parser
      }
    }
  },
  {
    ignores: ['build/', 'node_modules/', '.svelte-kit/']
  }
];