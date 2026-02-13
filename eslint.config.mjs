import withNuxt from './.nuxt/eslint.config.mjs'
import atx from './eslint-plugins/index.mjs'

export default withNuxt(
  // ATX design system rules (all .vue files)
  ...atx.configs.recommended,

  // Project-level overrides
  {
    rules: {
      // No unused variables/imports
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Consistent component naming (PascalCase)
      'vue/component-name-in-template-casing': ['warn', 'PascalCase'],

      // Require multi-word component names (Nuxt auto-imports bypass this)
      'vue/multi-word-component-names': 'off',

      // No console in production code
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Align void element self-closing with prettier (prettier adds />)
      'vue/html-self-closing': ['warn', {
        html: { void: 'always', normal: 'always', component: 'always' },
      }],
    },
  }
)
