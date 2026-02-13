/**
 * eslint-plugin-atx
 *
 * Custom ESLint rules enforcing the ATX design system conventions.
 * Violations are caught at edit-time in your IDE.
 *
 * Usage in eslint.config.mjs:
 *
 *   import atx from './eslint-plugins/index.mjs'
 *   export default withNuxt(...atx.configs.recommended)
 */

import noRawTailwindColors from './rules/no-raw-tailwind-colors.mjs'
import noNativeButton from './rules/no-native-button.mjs'
import noInlineSvg from './rules/no-inline-svg.mjs'
import lucideIconsOnly from './rules/lucide-icons-only.mjs'
import noStyleBlockLayout from './rules/no-style-block-layout.mjs'
import requireClientOnlySwitch from './rules/require-client-only-switch.mjs'

const plugin = {
  meta: {
    name: 'eslint-plugin-atx',
    version: '1.0.0',
  },

  rules: {
    'no-raw-tailwind-colors': noRawTailwindColors,
    'no-native-button': noNativeButton,
    'no-inline-svg': noInlineSvg,
    'lucide-icons-only': lucideIconsOnly,
    'no-style-block-layout': noStyleBlockLayout,
    'require-client-only-switch': requireClientOnlySwitch,
  },
}

// Flat config preset — apps just spread this into their config array
plugin.configs = {
  recommended: [
    {
      name: 'atx/recommended',
      plugins: { atx: plugin },
      files: ['**/*.vue'],
      rules: {
        'atx/no-raw-tailwind-colors': 'warn',
        'atx/no-native-button': 'warn',
        'atx/no-inline-svg': 'warn',
        'atx/lucide-icons-only': 'warn',
        'atx/no-style-block-layout': ['warn', { max: 50 }],
        'atx/require-client-only-switch': 'warn',
      },
    },
  ],
}

export default plugin
