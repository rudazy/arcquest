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

## Completed — Step 7 (2026-04-13)

- Created quiz data file: `src/lib/quiz.ts`
  - `QuizQuestion` type: id, question, options (4-tuple), correct_index, explanation
  - 10 exact questions about Arc blockchain per spec
  - Exports: `QUIZ_QUESTIONS` array, `QUIZ_XP_REWARD = 20`
- Built full quiz page: `src/app/quiz/page.tsx`
  - Pre-quiz screen: title, description, +20 XP gold badge, amber retake warning, Start button
  - Quiz in progress: question counter, animated progress bar, 4 clickable option cards with A/B/C/D labels
  - Correct answer: green border + checkmark, explanation shown, auto-advance after 1.2s
  - Wrong answer: red border + X, explanation shown 1.5s, then full-screen overlay with 3s countdown, reset to Q1
  - Attempt counter increments on each restart, shown in header and overlay
  - Completion screen: scale-up celebration animation, green checkmark, +20 XP gold badge, XP toast trigger
  - Already-earned tracking via localStorage key `arc_quiz_complete` — shows "already earned" message on repeat
  - Navigation links: Go to Dashboard, View Leaderboard
- State management: React useState only (currentQuestion, selectedOption, answerState, isComplete, hasStarted, attemptCount, alreadyEarned)
- Build: 0 errors, 0 warnings
- `/quiz` route: 4.33 kB, 153 kB First Load JS

---

## Completed — Step 8 (2026-04-13)

- Created leaderboard types: `src/types/leaderboard.ts`
  - `NftTier`, `LeaderboardEntry`, `LeaderboardFilter` types
  - Barrel-exported via `src/types/index.ts`
- Created level color helper: `src/lib/level-colors.ts`
  - `getLevelColor(level)` returns Tailwind text class per level (1-5)
- Created mock data: `src/lib/leaderboard-mock.ts`
  - 20 entries: CryptoKing (2400 XP, Lv5) through freshStart_01 (15 XP, Lv1)
  - NFT badges consistent with XP thresholds
- Built full leaderboard page: `src/app/leaderboard/page.tsx`
  - Header with trophy icon, subtitle
  - 3-tab filter: All Time (active) / This Week / By Project with project dropdown
  - Top 3 podium (desktop only): #2 left, #1 center elevated, #3 right
    - Gradient avatar circles with initials, rank colors (gold/silver/bronze)
  - Full 20-row table: Rank, Display Name, Level (colored pill), XP, Tasks (hidden mobile), NFTs
  - Rank #1/#2/#3 colored (gold/silver/bronze), rest default
  - "ludarep" row highlighted with purple tint + "You" badge
  - Row hover states, tabular-nums on all numeric columns
  - "Load more" disabled placeholder button
- Build: 0 errors, 0 warnings
- `/leaderboard` route: 3.01 kB, 142 kB First Load JS

---

## Completed — Step 9 (2026-04-13)

- Created project types: `src/types/project.ts`
  - `ProjectStatus`, `ProjectTaskType`, `ProjectTask`, `Project` types
  - Barrel-exported via `src/types/index.ts`
- Created mock data: `src/lib/projects-mock.ts`
  - 6 projects: 3 verified (Aave, Maple, Curve) + 3 community (Alpha, Beta, Gamma)
  - Each with realistic tasks (onchain, social, educational), XP values, participant counts
  - Helper functions: `getProjectBySlug()`, `getProjectsByStatus()`
- Built projects listing page: `src/app/projects/page.tsx`
  - Header with grid icon, subtitle
  - Official/Community tab switcher with purple active state
  - Community tab shows amber DYOR warning banner
  - 2-col responsive grid of project cards
  - Each card: gradient logo circle, status badge (cyan verified / amber community), category tag, description (2-line clamp), stats (XP / tasks / participants), "View Tasks" link
  - Community cards have amber left border accent
- Built project detail page: `src/app/projects/[slug]/page.tsx` + `project-detail.tsx`
  - Server component wrapper with `generateStaticParams` — all 6 slugs pre-rendered as SSG
  - Client component with full project detail: logo, name, status badge, category, website + X links, long description, stats
  - Task list with type badges (onchain purple, social blue, educational gold)
  - Each task card: title, description, XP badge, CTA button (Complete Task / Go to X / Take Quiz)
  - Completed state: green checkmark + "Completed" label, persisted in localStorage
  - Community warning banner at top for community projects
  - "All Projects" back link
- Build: 0 errors, 0 warnings
- `/projects` route: 3.27 kB, 151 kB First Load JS
- `/projects/[slug]` route: 4.06 kB, 151 kB First Load JS (SSG, 6 paths)

---

## Completed — Step 10 (2026-04-13)

- Created user types: `src/types/user.ts`
  - `UserNft`, `CompletedTask`, `UserProfile` interfaces
  - Reuses `NftTier` from leaderboard types (no duplication)
  - Barrel-exported via `src/types/index.ts`
- Created XP utilities: `src/lib/xp-utils.ts`
  - `getLevel(xp)` — maps XP to level 1-5 using canonical thresholds
  - `getXpToNextLevel(xp)` — returns current/required/level for progress bars
  - `getLevelLabel(level)` — returns title string per level
  - `getNftMilestones(xp)` — returns earned NFT tiers based on XP
- Created mock user: `src/lib/user-mock.ts`
  - "ludarep" — Lv3, 420 XP, rank 3, 6 completed tasks, bronze NFT
- Built dashboard: `src/app/dashboard/page.tsx`
  - Privy error boundary + wallet guard (connect prompt when disconnected)
  - Section 1: user header with gradient avatar, display name, level badge, rank link
  - Section 2: XP progress card with animated progress bar (420/500 toward Lv4)
  - Section 3: 4-card stats row (tasks, XP, level, rank)
  - Section 4: NFT milestones — 3 cards (bronze earned with date, silver/gold locked with progress)
  - Section 5: recent tasks list with project logo circles, task names, XP badges, dates
  - Section 6: quick actions row (Find Tasks, Take Quiz, View Leaderboard)
- Created shared profile component: `src/components/profile/profile-view.tsx`
  - Reusable across both profile pages — stats, NFT gallery, completed tasks
- Built profile page: `src/app/profile/page.tsx`
  - Privy-aware — shows "This is you" banner if wallet connected
  - Public-facing read-only view with NFT collection and completed tasks
- Built address profile page: `src/app/profile/[address]/page.tsx`
  - Dynamic route, compares connected wallet to address param for "This is you"
  - TODO comments for Supabase query replacement
- Build: 0 errors, 0 warnings
- `/dashboard` route: 4.16 kB, 281 kB First Load JS
- `/profile` route: 615 B, 280 kB First Load JS
- `/profile/[address]` route: 959 B, 281 kB First Load JS (dynamic)

---

## Completed — Step 11 (2026-04-14)

- Created task data helpers: `src/lib/tasks-helpers.ts`
  - `TaskWithProject` interface — extends `ProjectTask` with project metadata
  - `getAllTasks()` — flattens all tasks from all projects into a single list
  - `getTaskById(id)` — lookup single task with project context
  - `getRelatedTasks(taskId, limit)` — other tasks from same project
  - `getAllTaskIds()` — all task IDs for static params
  - `taskStorageKey()` — shared localStorage key builder (compatible with project-detail.tsx)
- Built tasks listing page: `src/app/tasks/page.tsx`
  - Header with task count and total XP available
  - 4-tab filter bar: All / Onchain / Social / Educational (purple active state)
  - Sorted by Most XP descending (default, indicated in UI)
  - Task cards: project logo circle, project name, type badge, task title, XP value or green "Done" status
  - Cards link to `/tasks/[taskId]`, hover state with purple border
  - Completion state loaded from localStorage
- Built task detail page: `src/app/tasks/[id]/page.tsx` + `task-detail.tsx`
  - Server wrapper with `generateStaticParams` — 15 task IDs pre-rendered as SSG
  - Client component with Privy error boundary
  - Header: project logo, type badge + icon, project link, title, description, XP badge
  - Three completion flows by task type:
    - Onchain: Privy wallet guard → "Connect Wallet to Complete" or "Complete Task" + RPC note
    - Social: "Go to X" external link → checkbox confirmation → "Confirm Completion" button
    - Educational: "Take Quiz" link to /quiz
  - Completed state: green success card with checkmark, XP earned, completion date
  - Related tasks section: up to 2 other tasks from same project, "More from [Project Name]"
  - Completion dates stored as ISO date strings (backwards compat with legacy "true" values)
- Build: 0 errors, 0 warnings
- `/tasks` route: 3.58 kB, 151 kB First Load JS (static)
- `/tasks/[id]` route: 4.8 kB, 282 kB First Load JS (SSG, 15 paths)
- Total pages: 43

---

## Current Task

_Step 11 complete. Awaiting Ludarep's instructions for next step._

---

## Blockers / Decisions Pending

- Founder X handles are placeholders (@handle1, @handle2) — need real handles
- @arcterminal X handle is a placeholder — confirm real handle
- Display name currently localStorage only — needs Supabase migration in later step
- Quiz XP award is client-side localStorage only — needs server-side validation in later step
- Leaderboard uses mock data — needs Supabase query in later step
- Project data is mock — needs Supabase + admin panel integration in later steps
- Task completion is localStorage only — needs server-side verification in later step
- Dashboard/profile use mock user — needs Supabase user query in later step
- getLevelLabel uses slightly different labels than xp-config titles — reconcile when wiring real data
