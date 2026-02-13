import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // No unused variables/imports
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Consistent component naming (PascalCase)
    'vue/component-name-in-template-casing': ['warn', 'PascalCase'],

    // Require multi-word component names (Nuxt auto-imports bypass this)
    'vue/multi-word-component-names': 'off',

    // No console in production code
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
})
