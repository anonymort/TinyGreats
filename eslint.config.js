export default [
  {
    files: ['**/*.{js,ts}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error'
    }
  },
  {
    ignores: ['build/', 'node_modules/', '.svelte-kit/', 'dist/']
  }
];