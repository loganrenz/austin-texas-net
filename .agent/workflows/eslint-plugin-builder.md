---
description: How to create, register, and verify a new ESLint rule in the eslint-plugin-atx custom plugin — the standard process for catching project-specific anti-patterns at lint time.
---

# ESLint Plugin Builder — Austin-Texas.net

Standard workflow for adding new rules to `eslint-plugins/` (the `eslint-plugin-atx` package). Follow these steps every time you need to catch a new anti-pattern at lint time.

---

## Pre-Flight Checks

Before writing a new rule:

1. **Check if there's an existing rule** that already handles the pattern:
   ```bash
   ls eslint-plugins/rules/
   ```
2. **Check if it's already in `index.mjs`** — a rule file might exist but not be registered.
3. **Decide if the pattern is lintable.** ESLint is good at detecting _presence_ of bad patterns. It is bad at detecting _absence_ of good patterns (e.g., "this file should have caching" is not lintable; "this file uses `readBody` without Zod" is lintable).

---

## Step 1 — Write the Rule

Create the rule file at `eslint-plugins/rules/<rule-name>.mjs`.

### Conventions

- **One file per rule**, named with kebab-case matching the rule name.
- **ESM only** — `export default { meta, create }`.
- **Vue template rules** use `defineTemplateBodyVisitor` from `../utils.mjs`.
- **Script-level rules** (for `.ts`/`.vue` `<script>` blocks) use standard ESTree AST selectors.
- **Server-only rules** should check `context.filename` to scope by directory.

### Template (Vue template rule)

```js
import { defineTemplateBodyVisitor } from '../utils.mjs'

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'One-line description of what this rule prohibits',
      category: 'ATX Design System',
    },
    messages: {
      messageId: 'Human-readable error message with {{ placeholder }}.',
    },
    schema: [],
  },

  create(context) {
    if (!context.filename.endsWith('.vue')) return {}

    return defineTemplateBodyVisitor(context, {
      'VElement[name="bad-element"]'(node) {
        context.report({ node: node.startTag, messageId: 'messageId' })
      },
    })
  },
}
```

### Template (Script/TS rule)

```js
/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'One-line description',
      category: 'ATX Server Safety',
    },
    messages: {
      messageId: 'Error message.',
    },
    schema: [],
  },

  create(context) {
    return {
      // AST selector for the pattern
      CallExpression(node) {
        // detection logic
        context.report({ node, messageId: 'messageId' })
      },
    }
  },
}
```

---

## Step 2 — Register the Rule

Edit `eslint-plugins/index.mjs`:

1. Add the `import` at the top with the other imports.
2. Add the rule to the `rules` object in the `plugin` definition.
3. Add the rule + severity to the appropriate config in `plugin.configs`.

### Choosing the Config Target

- **Vue template rules** → add to the existing `recommended` config (`files: ['**/*.vue']`).
- **Server/TS-only rules** → add a new `server` config (`files: ['server/**/*.ts']`) or expand to a `full` config covering both.

### Choosing Severity

- `'warn'` — guideline, doesn't block CI (use for new rules during migration).
- `'error'` — hard requirement, blocks CI after all violations are fixed.

---

## Step 3 — Register Server-Scoped Config (if needed)

If the new rule targets `.ts` files (not Vue templates), you need a separate config entry because the existing `recommended` config only targets `**/*.vue`.

Add a new config in `plugin.configs` and spread it in `eslint.config.mjs`:

```js
// In eslint-plugins/index.mjs
plugin.configs = {
  recommended: [
    /* existing vue rules */
  ],
  server: [
    {
      name: 'atx/server',
      plugins: { atx: plugin },
      files: ['server/**/*.ts'],
      rules: {
        'atx/new-server-rule': 'warn',
      },
    },
  ],
}

// In eslint.config.mjs
export default withNuxt(
  ...atx.configs.recommended,
  ...atx.configs.server, // ← add this
)
```

---

## Step 4 — Verify the Rule Fires

1. Run lint against a file you know has the violation:
   ```bash
   pnpm eslint <path-to-violating-file>
   ```
2. Confirm the rule name and message appear in the output.
3. Run full lint to see the total violation count:
   ```bash
   pnpm lint
   ```

---

## Step 5 — Fix or Suppress

- If the violations can be fixed now, fix them.
- If fixing is too large for this PR, leave the rule as `'warn'` and create a tracking issue.
- **Never add `eslint-disable` comments** — if the rule is wrong, fix the rule.

---

## Step 6 — Escalate to `'error'` After Cleanup

Once all violations for a rule are resolved:

1. Change the severity from `'warn'` to `'error'` in `index.mjs`.
2. Run `pnpm lint` to confirm zero violations.
3. Commit — CI will now block any regressions.
