# Arc Terminal — Task Log

Started: 2026-04-12
Owner: Ludarep

---

## Current Task

**Step 1 of 30 — Scaffold the project**

Goal: Stand up a clean Next.js 14 App Router base with TypeScript strict mode,
Tailwind, shadcn/ui initialized, and all core dependencies pinned and ready
for Step 2 to start building features against.

### Plan (pending approval)

1. **Package manager decision** — pnpm recommended (supply-chain protection,
   ecosystem fit). Awaiting Ludarep confirmation.

2. **Init Next.js 14 App Router**
   - `create-next-app` with TypeScript, Tailwind, ESLint, App Router, `src/` dir, import alias `@/*`
   - Node 20+ target
   - Target latest stable Next 14.x (not 15, since CLAUDE.md locks Next 14)

3. **TypeScript strict mode lockdown**
   - `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
   - Ban `any` via ESLint rule

4. **Supply-chain security**
   - Add `.npmrc` with `minimum-release-age=10080` (pnpm, 7 days)
   - Pin all dependency versions exactly — no `^` or `~`

5. **Install core dependencies**
   - `framer-motion` (animations)
   - `@privy-io/react-auth` (wallet connect)
   - `@supabase/supabase-js` + `@supabase/ssr` (database)
   - `viem` (onchain reads)
   - `zod` (input validation)
   - `clsx`, `tailwind-merge`, `class-variance-authority` (shadcn deps)
   - `lucide-react` (icons)

6. **shadcn/ui init**
   - Run `shadcn init` with dark theme default per CLAUDE.md rules
   - Configure `components.json` for `src/components/ui`
   - Skip default Inter font — will wire display font in Step 2

7. **Folder structure**
   ```
   src/
     app/              Next.js routes
     components/
       ui/             shadcn primitives
     lib/              utilities, clients (supabase, viem, privy)
     types/            shared TypeScript types
     config/           env validation, constants
   docs/               ADRs and reference material
   tasks/              todo.md, lessons.md
   contracts/          (placeholder for later steps)
   ```

8. **Environment & config**
   - `.env.example` with placeholder structure only (no real values)
   - `src/config/env.ts` with Zod-validated env schema, fail-fast on missing vars
   - Keys needed: `NEXT_PUBLIC_PRIVY_APP_ID`, `NEXT_PUBLIC_SUPABASE_URL`,
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
     `NEXT_PUBLIC_ARC_RPC_URL`, `NEXT_PUBLIC_ARC_CHAIN_ID`

9. **Git hygiene**
   - `.gitignore` covers `node_modules`, `.next`, `.env*` (except `.env.example`),
     `coverage`, `.DS_Store`
   - Verify no secrets can be committed

10. **Baseline README**
    - What Arc Terminal is, install, run, env vars, stack
    - No author/co-author attribution to AI tools (CLAUDE.md rule)

11. **Verify it boots**
    - `pnpm dev` runs clean
    - `pnpm build` passes
    - `pnpm lint` passes
    - `tsc --noEmit` passes

### Out of scope for Step 1
- Any UI beyond the Next.js default landing page
- Actual Privy/Supabase/Viem client wiring (clients installed, not configured)
- Contract code
- Tests (no app code to test yet — tests start Step 2)

---

## Completed — Step 1 (2026-04-12)

- Scaffolded Next.js 14.2.33 App Router via `create-next-app` into `scaffold-tmp`,
  merged contents up to repo root, cleaned up temp dir (CLAUDE.md + `tasks/`
  preserved untouched)
- Added `.npmrc` with `minimum-release-age=10080` (7-day quarantine), `auto-install-peers=true`
- Pinned all dependencies to exact versions in `package.json` — no `^` or `~`
- Tightened `tsconfig.json`: added `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`, `allowJs: false`,
  explicit `target: ES2022`
- Tightened ESLint: ban `any`, enforce unused-var rule, warn on `console`
- Added core dependencies (all version-checked against minimum-release-age):
  - `@privy-io/react-auth@3.19.0`
  - `@supabase/supabase-js@2.101.1`, `@supabase/ssr@0.10.0`
  - `viem@2.47.6`
  - `zod@3.25.76` (pinned to v3 — abitype peer dep requires `zod@^3`)
  - `framer-motion@12.38.0`
  - `lucide-react@1.7.0`
  - shadcn deps: `clsx@2.1.1`, `tailwind-merge@3.4.1`, `class-variance-authority@0.7.1`,
    `tailwindcss-animate@1.0.7`
- Wrote `components.json` for shadcn (new-york style, zinc base, dark-first, CSS vars)
- Created `src/lib/utils.ts` with `cn()` helper
- Replaced scaffolded `globals.css` with shadcn theme tokens (light + dark)
- Replaced scaffolded `layout.tsx` to use Arc Terminal metadata, `dark` class on html,
  removed Geist font loader (fonts will be wired in Step 2 per UI skill rules)
- Replaced scaffolded `page.tsx` with minimal "Scaffold online" placeholder —
  no Next.js branding, no AI-tell layout
- Created `src/config/env.ts` — Zod-validated env with server/client split, fail-fast
- Created `.env.example` with placeholder structure (no real values)
- Created folder structure: `src/{lib,config,types,components/ui}`, `docs/`, `contracts/`
- Rewrote `.gitignore` to cover `.env*` variants, `pnpm-debug.log`, editor dirs, scaffold leftovers
- Rewrote `README.md` for Arc Terminal (no Next.js boilerplate)
- Added `typecheck` script

### Verification (all passing)

- `pnpm typecheck` — clean
- `pnpm lint` — no warnings or errors
- `pnpm build` — compiled successfully, 5/5 static pages, 87.3 kB First Load JS
  - `/` → 138 B route size
  - `/_not-found` → 871 B

### Known warnings (non-blocking)

- Ignored build scripts: `@reown/appkit`, `bufferutil`, `keccak`, `unrs-resolver`,
  `utf-8-validate`. These are optional native binding builds. App works without them.
  Can enable later via `pnpm approve-builds` if we need the perf.

### Notes for next session

- Step 2 will wire shadcn components + display font per `/mnt/skills/public/frontend-design/SKILL.md`
- Dark-first theme is already applied via `<html class="dark">` and CSS vars
- No secrets anywhere in code, history, or config — safe to commit

---

## Completed — Step 2 (2026-04-12)

- Created `src/types/xp.ts` — full type system for XP config:
  `TaskType`, `VerifierType`, `TaskDefinition`, `LevelDefinition`,
  `NftMilestone`, `OnboardingStep`, `QuizQuestion`, `XpConfig`
- Created `src/config/xp-config.ts` — the single source of truth:
  - **10 task definitions**: follow_arc_x, follow_arcquest_x, follow_founder_x,
    join_discord, retweet, visit_site, onchain_swap, onchain_lend,
    onchain_bridge, arc_quiz
  - **5 levels**: New Explorer (0) → Arc Legend (1000)
  - **3 NFT milestones**: Bronze soulbound (100), Silver soulbound (500),
    Gold tradeable (1000) — all ERC-1155
  - **6 onboarding steps**: wallet → display name → 3 X follows → quiz (optional)
  - **10 quiz questions** about Arc ecosystem (Circle, USDC, soulbound NFTs,
    ERC-1155, XP mechanics, level system, ArcQuest purpose)
  - **Rate limits**: 3 verifications/min, 30s poll interval, 5min max poll, 60s visit timer
  - **Expiry**: onchain + retweet tasks expire in 7 days, others no expiry
- Updated `src/types/index.ts` barrel export with all XP types
- Config uses `as const satisfies XpConfig` for maximum type inference
- `pnpm typecheck` — clean
- `pnpm lint` — 0 warnings / errors

### Notes for next session

- Step 3 is "Map All Pages" — define route structure and auth requirements
- Quiz questions may need Ludarep review — they're based on BUILD_PLAN data,
  not official Arc docs. Swap out if any are inaccurate.
- `xp-config.ts` is the canonical reference for all XP values. No other
  file should hardcode XP numbers.

---

## Completed — Steps 3-4 (2026-04-12)

- Mapped all pages and created route scaffolds (step 3)
- Built layout system: navbar, footer, app shell, CSS variables (step 4)

---

## Completed — Step 5 (2026-04-13)

- Built homepage at `src/app/page.tsx`:
  - Hero section with animated purple/cyan orbs, headline with purple glow, CTA buttons
  - Stats bar (4 cards: Total Users, XP Earned, Tasks Completed, Projects Listed)
  - Reusable `PhaseCarousel` component with auto-slide (3s), manual arrows/dots, framer-motion transitions
  - Three carousel sections: Phase 1 (purple), Phase 2 (cyan, verified), Phase 3 (amber, community)
- Files: `src/components/home/{hero,stats-bar,phase-carousel}.tsx`
- Build: 0 errors, 0 warnings

---

## Completed — Step 6 (2026-04-13)

- Created onboarding state machine: `src/lib/onboarding.ts`
  - 5 steps: connect_wallet (0 XP), set_display_name (5 XP), follow_arc (5 XP),
    follow_arcterminal (5 XP), follow_founders (10 XP) = 25 XP total
- Built XP toast notification: `src/components/ui/xp-toast.tsx`
  - Slide-up animation, gold text, auto-dismiss 2s, reusable via amount/trigger props
- Built full onboarding page: `src/app/onboarding/page.tsx`
  - Step-by-step flow with progress bar, step-specific UIs
  - Wallet auto-advance, display name validation (3-20 chars, alphanum + underscores)
  - Follow link pattern: open X profile, checkbox confirmation, then continue
  - Founders step: two sub-follows, both required
  - Completion screen with fade-in, total XP, dashboard/leaderboard links
  - Privy error boundary for missing wallet provider
  - Wallet guard: blocks progress if disconnected mid-flow
  - Display name saved to localStorage (Supabase later)
- Build: 0 errors, 0 warnings
- `/onboarding` route: 3.42 kB, 282 kB First Load JS

---

## Current Task

_Step 6 complete. Awaiting Ludarep's instructions for Step 7._

---

## Blockers / Decisions Pending

- Quiz questions are educated guesses about Arc — confirm accuracy before launch
- Founder X handles are placeholders (@handle1, @handle2) — need real handles
- @arcterminal X handle is a placeholder — confirm real handle
- Display name currently localStorage only — needs Supabase migration in later step
