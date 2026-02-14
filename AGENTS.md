# Agent Rules

## Git Discipline

- **Commit often.** After every meaningful change (new feature, bug fix, refactor), stage and commit with a clear message. Do not batch unrelated changes into a single commit.
- **Use conventional commits.** Format: `type: short description` — e.g. `fix: resolve pollen chart type error`, `feat: add radar keyword filters`, `chore: update deps`.
- **Never commit secrets, `.env` files, or API keys.** Verify `.gitignore` covers all sensitive files before committing.

## Code Quality

- **Run `pnpm typecheck` before committing.** All TypeScript errors must be resolved — never commit code with type errors.
- **Run `pnpm lint` before committing.** Fix all lint issues before pushing.
- **Zero errors, zero warnings.** A task is not complete until `pnpm lint` reports 0 errors and 0 warnings. No exceptions.
- **No `any` types unless absolutely necessary.** If `any` is unavoidable (e.g. third-party lib mismatch), add a comment explaining why.
- **No `console.log` in committed code.** Use proper logging or remove debug statements.

## Nuxt 4 & Nuxt UI 4

- **Use Nuxt UI 4 semantic colors** — `primary`, `secondary`, `success`, `warning`, `error`, `info`, `neutral`. Never use raw CSS colors like `red`, `green`, `blue` in component props.
- **Use `items` not `options`** on `USelect`, `URadioGroup`, and similar Nuxt UI 4 components.
- **Use `useAsyncData` or `useFetch`** for all data fetching — never raw `fetch()` in components.
- **Follow Nuxt 4 directory structure** — app code in `app/`, server code in `server/`.

## Styling

- **Tailwind utility classes only.** Do not add `<style>` or `<style scoped>` blocks to components or pages. All styling must use Tailwind utility classes directly in template markup.
- **No custom CSS in Vue files.** If a utility class doesn't exist, compose Tailwind classes or extend the theme in `app/assets/css/main.css` — never write one-off CSS in a component.
- **Exception: `app/assets/css/main.css`** is the only place custom CSS is allowed (global resets, theme extensions, Tailwind `@layer` directives, keyframe animations).

## Homepage Design Rules

- **Light-first.** The homepage is bright, open, and modern. No dark hero backgrounds. No dark overlays.
- **Consistent category cards.** Every category card follows the same visual pattern: icon, title, tagline, child link list.
- **Live data sections must use skeleton loading states.** Never show empty voids while data loads.
- **All interactive elements must have hover/focus transitions.** Cards lift on hover. Links shift color. Buttons have depth changes.
- **Micro-animations required.** Cards fade-up on viewport entry. No static, abrupt content appearance.
- **No placeholder images.** Generate real images or omit. Broken/missing images are never acceptable.

## Expansion Rules

- **New categories require Radar analysis backing.** No category is created on a whim — validated demand must exist.
- **Every new category must have a hub page before child pages are created.** Hub → children, always.
- **`useSiteData.ts` is the single source of truth** for category structure. Update it first, everything else follows.
- **URL slugs are permanent.** Once published, a slug never changes.

## Cloudflare Workers / D1

- **All server utils must be edge-compatible.** No Node.js-only APIs (`fs`, `path`, `crypto` from Node). Use Web APIs and `h3` utilities.
- **Use drizzle-orm for all database queries.** No raw SQL strings outside of migration files.

## File Hygiene

- **No placeholder content.** If you need an image, generate one. If you need data, use realistic mock data.
- **Keep files focused.** One component per file, one API route per file. Extract shared logic into `server/utils/` or `app/composables/`.
- **Delete dead code.** Don't leave commented-out blocks or unused imports.
