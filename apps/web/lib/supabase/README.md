# lib/supabase — Scaffold (NOT ACTIVE)

This directory contains the Supabase client scaffold. No connection to Supabase exists yet. No queries run. The pipeline still uses local JSON files via the repository pattern.

## Files

| File | Purpose |
|------|---------|
| `config.ts` | Environment variable references (URL, keys) |
| `types.ts` | Database type stubs — replace with `supabase gen types typescript` output |
| `client.ts` | Browser client placeholder — requires `@supabase/ssr` |
| `server.ts` | Server client factory placeholder — requires `@supabase/ssr` |

## To activate

```bash
# 1. Install the package
pnpm add @supabase/ssr

# 2. Set env vars in .env.local (see .env.example)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...

# 3. Run the first migration
supabase db push

# 4. Generate types
npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts

# 5. Replace client.ts and server.ts placeholders with real implementations
```

## Key distinction: publishable vs secret key

| Key | Variable | Scope | RLS |
|-----|---------|-------|-----|
| Publishable (anon) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Enforced |
| Secret (service role) | `SUPABASE_SECRET_KEY` | Server only | **Bypassed** |

The secret key bypasses Row Level Security entirely. Use it only in server-side code (`server.ts`, API Routes, Server Actions). Never use `NEXT_PUBLIC_` for the secret key.

## RLS requirement

When tables become public-facing, RLS policies are mandatory. A table without RLS and a publishable key is effectively world-readable and writable. Enable RLS on every table before exposing it.

## Migration to Supabase repositories

When ready, create:
- `lib/repositories/supabase-commune-repository.ts implements CommuneRepository`
- `lib/repositories/supabase-commune-risk-repository.ts implements CommuneRiskRepository`

Swap the singletons in the local repository files. The pipeline (`normalize-openroute-route.ts`) does not change.

See [docs/repositories.md](../../../../docs/repositories.md) and [docs/data-architecture.md](../../../../docs/data-architecture.md).
