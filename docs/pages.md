# Arc Terminal — Page Map

Complete route specification for the Arc Terminal platform.
Every route is listed here with auth requirements and purpose.
Reference this file when building or linking between pages.

---

## Public Routes (no wallet required)

| Route | Page | Description |
|---|---|---|
| `/` | Homepage | 3-phase carousel (Phase 1: Get Started 3 slides, Phase 2: Verified Projects 3 slides, Phase 3: Community Projects 3 slides) + stats bar + footer |
| `/projects` | Explore Projects | All projects listing with Official + Community tabs |
| `/projects/[slug]` | Project Detail | Individual project page with task list, links, description |
| `/leaderboard` | Leaderboard | Global leaderboard — filter by this week / all time / by project. Display names only, no wallet addresses |
| `/quiz` | Arc Quiz | 10 questions about the Arc ecosystem. Fail one = restart from Q1. XP awarded once on first pass |

---

## Auth-Gated Routes (wallet required)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | User command center — XP progress bar, level, active tasks, recently completed, NFTs, rank |
| `/profile` | My Profile | Current user's own profile view |
| `/profile/[address]` | User Profile | Another user's public profile — display name, level, XP, task history, NFT gallery |
| `/tasks` | All Tasks | Browse all available tasks across all projects |
| `/tasks/[id]` | Task Detail | Individual task page with verification UI, status tracking, XP reward |
| `/onboarding` | Onboarding | Mandatory post-connect flow: set display name, follow Arc/ArcQuest/founders on X. Must complete before quest board unlocks |

---

## Admin Routes

| Route | Page | Description |
|---|---|---|
| `/admin` | Admin Panel | Root admin view — platform stats, quick links. Protected by wallet allowlist |
| `/admin/projects` | Project Review | Approve/reject community project submissions. Queue view: pending, approved, rejected |
| `/admin/projects/new` | New Project | Submit a new project listing form (name, category, contract, tasks, socials) |
| `/admin/tasks` | Task Management | View, edit, and manage tasks across all projects. Manual XP adjustment |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/xp/award` | POST | Award XP to a user. Server-side only, requires verifier auth |
| `/api/xp/status` | GET | Get user XP balance and current level |
| `/api/tasks/verify` | POST | Trigger task verification (onchain, social, or timer) |
| `/api/tasks/[id]` | GET | Get task data and completion status |
| `/api/projects` | GET | List all projects (paginated, filterable by category) |
| `/api/projects/[slug]` | GET | Single project with tasks and stats |
| `/api/leaderboard` | GET | Leaderboard data — supports timeframe and project filters |
| `/api/quiz/submit` | POST | Submit quiz answer for current question. Returns next question or restart |
| `/api/auth/[...privy]` | ALL | Privy auth handlers — wallet connect, session management |

---

## Route Protection Summary

```
Public:     /  /projects  /projects/[slug]  /leaderboard  /quiz
Wallet:     /dashboard  /profile  /profile/[address]  /tasks  /tasks/[id]  /onboarding
Admin:      /admin  /admin/projects  /admin/projects/new  /admin/tasks
API:        /api/*  (auth enforced per-route in middleware)
```

---

## Build Order

Recommended order to build these pages, based on dependency chain:

1. **Homepage** (`/`) — first impression, drives all traffic
2. **Onboarding** (`/onboarding`) — first thing new users hit after wallet connect
3. **Dashboard** (`/dashboard`) — user home base after onboarding
4. **Projects listing** (`/projects`) — browse before acting
5. **Project detail** (`/projects/[slug]`) �� where tasks live
6. **Tasks listing** (`/tasks`) — all tasks view
7. **Task detail** (`/tasks/[id]`) — verification UI
8. **Quiz** (`/quiz`) — optional but high-XP reward
9. **Leaderboard** (`/leaderboard`) — social proof, retention
10. **Profile pages** (`/profile`, `/profile/[address]`) — identity layer
11. **Admin panel** (`/admin`, `/admin/projects`, `/admin/tasks`) — ops tooling
12. **New project form** (`/admin/projects/new`) — growth channel

API routes are built alongside their corresponding frontend pages.
