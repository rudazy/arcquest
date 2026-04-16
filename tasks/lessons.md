# Arc Terminal — Lessons Learned

---

## Session: Steps 1–14

### Always keep XP server-side
Client-side XP state (localStorage) is only for optimistic UI. The canonical source is the DB. Any XP award path that does not go through a server API route is a security hole. Never trust the client for XP values.

### Privy error boundary pattern
Wrap any component that calls `usePrivy()` or `useWallets()` in a class-based `PrivyBoundary`. Without it, a missing or misconfigured `NEXT_PUBLIC_PRIVY_APP_ID` crashes the entire page. The boundary degrades gracefully. For public pages (quiz, tasks listing) the boundary's fallback must not block the main UI — use a null-returning boundary on an isolated sub-component instead.

### TypeScript strict mode + noUncheckedIndexedAccess
`array[i]` returns `T | undefined` under `noUncheckedIndexedAccess`. Always guard with `!== undefined` or optional chaining before using array elements from `QUIZ_QUESTIONS[index]`.

### localStorage is not a source of truth
localStorage is unavailable in SSR, some privacy browsers, and incognito. Always wrap reads/writes in try/catch. Use it only for optimistic caching — the DB is the source of truth.

### Mock data as a documented fallback
API routes that check `if (!supabase)` fall back to mock data. This keeps development fast without a Supabase instance while ensuring production has real queries. Never remove the fallback — Supabase may be temporarily unavailable.

### Schema and API routes must stay in sync
The `docs/schema.sql` file is the single source of truth for table/column names. Mismatches (e.g., `xp_ledger` vs `xp_events`) only surface at runtime. Define schema first, write routes against it, check for drift before every session.

### increment_xp must be atomic
Incrementing XP and recomputing level in two separate SQL statements has a race condition window between them. Use a `security definer` stored function (`increment_xp`) for atomic updates. Never split XP increment and level recompute across two API calls.

### Wallet address privacy is multi-layer
`wallet_address` must be excluded from every public API response. The leaderboard, profile, and project pages show display names only. Enforce this in the API layer by never selecting `wallet_address` in public queries — do not rely solely on frontend filtering.

### Optimistic UI + server verification pattern
For task completions: (1) update localStorage immediately so the UI responds instantly, (2) call the server API in the background, (3) show XP toast on server confirmation. If the server rejects (already completed, invalid wallet), the localStorage state is still set locally but no XP is awarded. Source of truth for XP is always the DB.

---

## Session: Steps 15–20

### WalletSideEffect pattern for optional Privy on public pages
Public pages (quiz, tasks listing, project detail) that want optional wallet context for server API calls should use a null-returning `WalletSideEffect` component inside a `WalletBoundary` class component. If Privy errors, the boundary catches it silently (returns null), and the page degrades gracefully to localStorage-only mode. Never add `usePrivy()` directly to a public page's root component without this isolation.

### revalidate = 300 vs. cache headers
Next.js App Router API routes with `export const revalidate = 300` are ISR-cached at the route level. For the leaderboard this is exactly right — 5-minute staleness is acceptable. Do not use `fetch` caching options inside the route handler itself; the route-level `revalidate` is cleaner and consistent.

### Supabase service role + RLS
The service role key bypasses RLS automatically. Never expose it to the client. All write operations (XP award, task completion, quiz submit) must go through server-side API routes that use `createServerClient()` with the service role key.
