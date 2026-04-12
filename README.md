# Arc Terminal

Quest and XP platform for the Arc ecosystem. Complete onchain actions and
social tasks across Arc protocols, level up publicly, and claim soulbound
and tradeable NFTs at milestones.

Built on Arc testnet — Circle's stablecoin L1.

## Stack

- Next.js 14 (App Router) + TypeScript strict mode
- Tailwind CSS + shadcn/ui (new-york style, dark by default)
- Framer Motion for animation
- Privy for wallet connect
- Supabase for database (client and server via `@supabase/ssr`)
- viem for onchain reads
- Zod for runtime validation

## Requirements

- Node.js >= 20
- pnpm >= 10

## Install

```bash
pnpm install
```

Dependencies are pinned to exact versions. Supply-chain protection
(`minimum-release-age=10080`) is configured in `.npmrc` — any package
newer than 7 days will be rejected at install time.

## Environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Env vars are validated at runtime via Zod in `src/config/env.ts`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy app id for wallet connect |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
| `NEXT_PUBLIC_ARC_RPC_URL` | Arc testnet RPC URL |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | Arc testnet chain id |

## Scripts

```bash
pnpm dev        # start dev server on :3000
pnpm build      # production build
pnpm start      # serve production build
pnpm lint       # eslint (next config + strict TS rules)
pnpm typecheck  # tsc --noEmit
```

## Structure

```
src/
  app/          Next.js App Router routes
  components/
    ui/         shadcn primitives
  config/       env validation, runtime constants
  lib/          client factories, utilities
  types/        shared TypeScript types
contracts/      Solidity contracts (later steps)
docs/           architecture, ADRs, reference
tasks/          todo.md, lessons.md (session state)
```

## Security

- Never display wallet addresses publicly
- Community projects always show amber warning banner
- XP is awarded server-side only — never trust the client
- No wallet required to browse the homepage
- Supabase service role key is server-only, never exposed to the client
