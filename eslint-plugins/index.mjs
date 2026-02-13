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
import noAttrsOnFragment from './rules/no-attrs-on-fragment.mjs'
import noNativeInput from './rules/no-native-input.mjs'
import noNativeForm from './rules/no-native-form.mjs'
import noNativeTable from './rules/no-native-table.mjs'
import preferULink from './rules/prefer-ulink.mjs'
import noNativeLayout from './rules/no-native-layout.mjs'
import noSelectEmptyValue from './rules/no-select-empty-value.mjs'

const plugin = {
  meta: {
    name: 'eslint-plugin-atx',
    version: '2.0.0',
  },

  rules: {
    'no-raw-tailwind-colors': noRawTailwindColors,
    'no-native-button': noNativeButton,
    'no-inline-svg': noInlineSvg,
    'lucide-icons-only': lucideIconsOnly,
    'no-style-block-layout': noStyleBlockLayout,
    'require-client-only-switch': requireClientOnlySwitch,
    'no-attrs-on-fragment': noAttrsOnFragment,
    'no-native-input': noNativeInput,
    'no-native-form': noNativeForm,
    'no-native-table': noNativeTable,
    'prefer-ulink': preferULink,
    'no-native-layout': noNativeLayout,
    'no-select-empty-value': noSelectEmptyValue,
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
        'atx/no-style-block-layout': ['error', { max: 50 }],
        'atx/require-client-only-switch': 'warn',
        'atx/no-attrs-on-fragment': 'warn',
        'atx/no-native-input': 'warn',
        'atx/no-native-form': 'warn',
        'atx/no-native-table': 'warn',
        'atx/prefer-ulink': 'warn',
        'atx/no-native-layout': 'warn',
        'atx/no-select-empty-value': 'error',
      },
    },
  ],
}

export default plugin
