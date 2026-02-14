import withNuxt from './.nuxt/eslint.config.mjs'
import atx from './eslint-plugins/index.mjs'

export default withNuxt(
  // ATX design system rules (all .vue files)
  ...atx.configs.recommended,

  // ATX server safety rules (server/**/*.ts)
  ...atx.configs.server,

  // Project-level overrides
  {
    rules: {

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
