---
description: Sync environment variables from Doppler to Cloudflare Pages secrets
---

# Sync Doppler → Cloudflare

A native Doppler sync is configured for the `austin-texas-net` project. It automatically pushes secrets from the Doppler `prd` config to the Cloudflare Pages project `austin-texas-net` (production environment).

## Key naming conventions

- **Private runtime config** keys need a `NUXT_` prefix in Doppler for Nuxt to pick them up at runtime (e.g. `INGEST_API_KEY` → also store as `NUXT_INGEST_API_KEY`).
- **Public runtime config** keys need a `NUXT_PUBLIC_` prefix (e.g. `MAPKIT_TOKEN` → also store as `NUXT_PUBLIC_MAPKIT_TOKEN`).
- Both the raw key and the `NUXT_`-prefixed key should exist in Doppler.

## Adding a new secret

1. Add the secret to Doppler `prd` config.
2. If it's a Nuxt runtime config key, also add the `NUXT_` (private) or `NUXT_PUBLIC_` (public) prefixed version.
3. The native Doppler sync will automatically push to Cloudflare Pages.
4. If the secret is used by a cron worker, also set it on the worker: `echo "value" | npx wrangler secret put SECRET_NAME --name worker-name`

## Cron worker secrets

Cron workers (`pollen-cron`, `live-data-cron`, `search-radar-cron`, `real-estate-cron`) are standalone Workers, not part of the Pages project. Their secrets must be set separately via `wrangler secret put`. Currently all four share `INGEST_API_KEY`.

## Manual sync (fallback)

If the native sync is down, use this to push all Doppler secrets to Cloudflare Pages manually:

// turbo

1. Export Doppler `prd` secrets as JSON, add `NUXT_PUBLIC_` prefixed variants, and push to Cloudflare:

```sh
doppler secrets --project austin-texas-net --config prd --no-read-env --json \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
skip = {'DOPPLER_CONFIG','DOPPLER_ENVIRONMENT','DOPPLER_PROJECT'}
secrets = {k: v['computed'] for k, v in data.items() if k not in skip}

# Nuxt public runtimeConfig needs NUXT_PUBLIC_ prefix to override at runtime
public_mappings = {
    'MAPKIT_TOKEN': 'NUXT_PUBLIC_MAPKIT_TOKEN',
    'GA_MEASUREMENT_ID': 'NUXT_PUBLIC_GA_MEASUREMENT_ID',
    'POSTHOG_PUBLIC_KEY': 'NUXT_PUBLIC_POSTHOG_PUBLIC_KEY',
}
for src, dst in public_mappings.items():
    if src in secrets:
        secrets[dst] = secrets[src]

print(json.dumps(secrets))
" \
  | npx wrangler pages secret bulk --project-name austin-texas-net
```

2. Verify the output shows `✨ N secrets successfully uploaded`.
