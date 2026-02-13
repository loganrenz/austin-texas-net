/**
 * atx/no-attrs-on-fragment
 *
 * Detects Vue SFC templates with multiple root elements (fragments) that do
 * NOT declare `inheritAttrs: false`. When a parent passes `style` or `class`
 * to such a component, Vue emits a runtime warning because it cannot
 * automatically inherit the attributes onto a single root node.
 *
 * Fix options:
 *   1. Wrap template content in a single root element.
 *   2. Add `defineOptions({ inheritAttrs: false })` and manually bind
 *      `$attrs` where needed.
 */

import { defineTemplateBodyVisitor } from '../utils.mjs'

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow multi-root (fragment) templates without inheritAttrs: false',
      category: 'ATX Design System',
    },
    messages: {
      fragmentNeedsInheritAttrs:
        'This component has {{ count }} root elements (fragment template) but does not set `inheritAttrs: false`. ' +
        'If a parent passes style/class, Vue will emit a runtime warning. ' +
        'Either wrap in a single root element or add `defineOptions({ inheritAttrs: false })`.',
    },
    schema: [],
  },

  create(context) {
    if (!context.filename.endsWith('.vue')) return {}

    // Track whether inheritAttrs: false was declared in <script setup> or <script>
    let hasInheritAttrsFalse = false

    const scriptVisitor = {
      // Match: defineOptions({ inheritAttrs: false })
      'CallExpression[callee.name="defineOptions"]'(node) {
        const arg = node.arguments[0]
        if (arg && arg.type === 'ObjectExpression') {
          for (const prop of arg.properties) {
            if (
              prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'inheritAttrs' &&
              prop.value.type === 'Literal' &&
              prop.value.value === false
            ) {
              hasInheritAttrsFalse = true
            }
          }
        }
      },

      // Match: export default { inheritAttrs: false }
      'ExportDefaultDeclaration > ObjectExpression > Property[key.name="inheritAttrs"]'(
        node
      ) {
        if (node.value.type === 'Literal' && node.value.value === false) {
          hasInheritAttrsFalse = true
        }
      },
    }

    return defineTemplateBodyVisitor(
      context,
      {
        // Fires once for the template root — check children
        'VElement[name="template"]'(node) {
          // Only process the top-level <template> (document root)
          if (node.parent && node.parent.type !== 'VDocumentFragment') return

          const rootElements = node.children.filter(
            (child) =>
              child.type === 'VElement' ||
              // Text nodes that are non-whitespace count as roots
              (child.type === 'VText' && child.value.trim().length > 0)
          )

          if (rootElements.length > 1 && !hasInheritAttrsFalse) {
            context.report({
              node: node.startTag || node,
              messageId: 'fragmentNeedsInheritAttrs',
              data: { count: String(rootElements.length) },
            })
          }
        },
      },
      scriptVisitor
    )
  },
}
