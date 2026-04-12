# ArcQuest — Complete Build Guide
### The Arc Ecosystem Quest & Reputation Hub
**Version 1.0 — Internal Build Document**

---

## What We Are Building

ArcQuest is the first ecosystem hub for the Arc blockchain. Users connect their wallet, complete tasks across Arc protocols (onchain + social), earn XP, level up, and claim NFTs. Projects get listed and earn community exposure. We are the glue between every application building on Arc — launching before mainnet to become the default reputation and discovery layer for the entire ecosystem.

**Core loop:** Browse projects → Complete tasks → Earn XP → Level up → Claim NFTs → Flex on leaderboard

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Standard, fast, SSR |
| Styling | Tailwind CSS + shadcn/ui | Consistent, fast UI |
| Animations | Framer Motion | Smooth carousel + level up moments |
| Wallet | Privy or RainbowKit | Arc testnet supported |
| Database | Supabase (Postgres) | Free tier, dashboard, auth helpers |
| Backend | Next.js API routes | Serverless, same deploy as frontend |
| Hosting | Vercel | Free tier, auto deploys from GitHub |
| RPC | Alchemy (Arc testnet) | Transaction verification |
| Contracts | Solidity on Arc testnet | XP registry + NFT milestone |
| Social auth | X OAuth + Discord OAuth | Follow/join verification |
| Background jobs | Railway (add later) | Continuous onchain polling |

---

## Design System

**Vibe:** Dark, techy, gamified. Think mission control meets Web3 quest platform.

**Colors:**
- Background: `#0a0a0f` (deep navy-black)
- Primary accent: `#7B5EA7` (Arc purple)
- Secondary accent: `#00d4ff` (electric cyan)
- Rewards/XP: `#f5c842` (gold)
- Success: `#22c55e` (green)
- Warning (community): `#f59e0b` (amber)
- Text primary: `#e2e8f0` (off-white)
- Text muted: `#64748b`

**Typography:**
- Display: Bold, large, tight tracking
- Body: Clean, readable, 16px base
- Mono: For addresses, XP numbers, task IDs

**Key UI patterns:**
- Glassmorphism cards with subtle border glow
- XP progress bars always visible
- Status chips: `[Not Started]` → `[In Progress]` → `[Verifying...]` → `[✅ Done]`
- Level badges as visual icons, not just text
- Celebration full-screen modal on NFT milestone

---

## XP + Level System

| Level | XP Required | Title |
|---|---|---|
| Lv1 | 0 | New Explorer |
| Lv2 | 50 | Arc Builder |
| Lv3 | 200 | Arc Veteran |
| Lv4 | 500 | Arc OG |
| Lv5 | 1000 | Arc Legend |

---

## NFT Milestones

| XP Threshold | NFT | Tradeable |
|---|---|---|
| 100 XP | Bronze Badge | No — soulbound ERC-1155 |
| 500 XP | Silver Badge | No — soulbound ERC-1155 |
| 1000 XP | Gold Badge | Yes — tradeable ERC-1155 |

---

## Task XP Values

| Task Type | XP | Notes |
|---|---|---|
| Follow on X | 5 XP | Per account |
| Join Discord | 10 XP | Per server |
| Visit project site | 5 XP | Timer-gated 60 seconds |
| Onchain action (swap/lend/bridge) | 30-50 XP | Verified via Arc RPC |
| Arc Quiz (10/10 correct) | 20 XP | Highest single reward, optional |
| Social retweet/quote | 5 XP | X OAuth verified |

---

## Privacy Rules

- **Never display wallet addresses publicly anywhere**
- Leaderboard shows display names only
- Profile shows display name + level + XP
- Users set display name on first connect
- ENS can be used as display name only if user explicitly sets it

---

## Project Listing Rules

- **Official tab:** Verified Arc ecosystem projects (Aave, Maple, Curve etc.)
- **Community tab:** Applied and manually approved by admin, amber warning shown always
- Warning text: *"Community Project — Not officially verified by Arc. Always do your own research before interacting."*
- Projects apply via public form
- Admin reviews and approves/rejects
- Each project provides: contract address, function signatures to watch, task list, X handle, Discord link

---

## Onboarding Flow (Mandatory Before Other Tasks)

1. Connect wallet
2. Set display name
3. Follow Arc X account → +5 XP
4. Follow ArcQuest X account → +5 XP
5. Follow each listed founder → +5 XP each
6. All above required before quest board unlocks

**Optional after onboarding:**
- Read Arc guide on platform
- Complete Arc Quiz (10 questions, fail one = restart from Q1, unlimited retakes, XP awarded once only) → +20 XP

---

## Onchain Verification Logic

```
1. User clicks [Start Task]
2. Backend records: { wallet, taskId, contractAddress, functionSig, startedAt }
3. User goes to dapp, completes action
4. User returns, clicks [Verify]
5. Backend queries Arc RPC:
   - Get all transactions from wallet to contractAddress
   - Filter: timestamp > startedAt
   - Filter: input includes functionSig
   - Filter: tx.from === wallet
6. If valid → call XPRegistry.sol → award XP
7. If not found → retry loop (poll every 30s for 5 minutes)
8. Mark task as completed, block re-attempt
```

**Anti-cheat:**
- Timestamp anchoring prevents old tx replay
- `completedTasks[wallet][taskId]` mapping blocks double claim
- `onlyVerifier` modifier blocks direct contract calls
- Rate limit: max 3 verifications per minute per wallet
- One wallet = one X account = one Discord (enforced at OAuth)

---

## Offchain Verification Logic

**X OAuth tasks:**
- User connects X account once (stored as X user ID)
- Follow check: `GET /2/users/:id/following` — check if target followed
- Retweet check: `GET /2/users/:id/retweets` — check tweet ID present
- MVP fallback: screenshot upload → manual admin verification

**Discord OAuth tasks:**
- User connects Discord once
- Membership check: verify user ID is member of target server
- Free, instant, no API cost

**Website visit tasks:**
- User clicks [Start Task] → project site opens in new tab
- 60 second timer starts
- [Verify] button activates after 60 seconds → XP awarded

**Quiz tasks:**
- 10 questions served one at a time from your backend
- Any wrong answer → reset to Q1 immediately
- All 10 correct → XP awarded once, flag set in DB

---

---

# THE 30 STEPS

---

## PHASE 1 — FOUNDATION
### Steps 1–5: Before writing a single line of code

---

### STEP 1 — Lock Name, Brand, and Domain

**Owner:** Project lead
**Output:** Brand kit doc

Tasks:
- Finalise platform name (suggested: ArcQuest)
- Register domain (arcquest.xyz or similar)
- Register X handle (@arcquest or similar)
- Create simple logo — wordmark + icon variant
- Document final color palette (use values from Design System above)
- Create brand kit doc shared with all team members

**Deliverable:** `brand-kit.md` with name, colors, fonts, logo files, domain, X handle

---

### STEP 2 — Define Complete XP + Task Spreadsheet

**Owner:** Project lead
**Output:** `xp-config.json`

Tasks:
- List every task type with exact XP values
- List every level threshold with title
- List every NFT milestone with tradeable/soulbound status
- List every onboarding task in order
- Define quiz questions (10 questions, 4 options each, one correct answer)
- Define task expiry windows (e.g. complete within 7 days of starting)

**Deliverable:** A single JSON or spreadsheet every developer references. No ambiguity on XP values ever.

```json
{
  "tasks": {
    "follow_x": { "xp": 5, "type": "social", "verifier": "x_oauth" },
    "join_discord": { "xp": 10, "type": "social", "verifier": "discord_oauth" },
    "onchain_swap": { "xp": 50, "type": "onchain", "verifier": "arc_rpc" },
    "arc_quiz": { "xp": 20, "type": "quiz", "verifier": "backend", "optional": true }
  },
  "levels": [
    { "level": 1, "xp": 0, "title": "New Explorer" },
    { "level": 2, "xp": 50, "title": "Arc Builder" },
    { "level": 3, "xp": 200, "title": "Arc Veteran" },
    { "level": 4, "xp": 500, "title": "Arc OG" },
    { "level": 5, "xp": 1000, "title": "Arc Legend" }
  ],
  "nfts": [
    { "threshold": 100, "name": "Bronze", "tradeable": false },
    { "threshold": 500, "name": "Silver", "tradeable": false },
    { "threshold": 1000, "name": "Gold", "tradeable": true }
  ]
}
```

---

### STEP 3 — Map All Pages

**Owner:** Frontend lead
**Output:** `pages.md`

Full page list:

| Page | Route | Auth Required |
|---|---|---|
| Homepage | `/` | No |
| Explore Projects | `/projects` | No |
| Project Detail | `/projects/[slug]` | No (wallet to start task) |
| Leaderboard | `/leaderboard` | No |
| User Profile | `/u/[username]` | No (own profile needs wallet) |
| Dashboard | `/dashboard` | Yes |
| Arc Guide | `/learn` | No |
| Arc Quiz | `/quiz` | Yes |
| Onboarding | `/onboarding` | Yes |
| NFT Gallery | `/nfts` | Yes |
| Admin Panel | `/admin` | Admin only |
| Project Application | `/apply` | No |
| 404 | | No |

---

### STEP 4 — Design Database Schema

**Owner:** Backend lead
**Output:** Supabase schema SQL file

Tables needed:

```sql
-- Users
users (id, wallet_address, display_name, x_user_id, discord_user_id, created_at)

-- XP
xp_ledger (id, user_id, task_id, xp_amount, awarded_at, tx_hash)

-- Task completions
task_completions (id, user_id, task_id, project_id, started_at, completed_at, verification_tx)

-- Projects
projects (id, name, slug, description, category, contract_address, x_handle, 
          discord_link, website, status, verified, created_at)

-- Tasks per project
project_tasks (id, project_id, title, description, task_type, xp_value, 
               function_sig, target_address, external_link, expires_days)

-- NFT claims
nft_claims (id, user_id, tier, claimed_at, token_id, tx_hash)

-- Quiz attempts
quiz_attempts (id, user_id, started_at, completed_at, passed, xp_awarded)

-- Project applications
applications (id, project_name, contact_email, x_handle, website, 
              description, category, task_list, status, submitted_at)
```

---

### STEP 5 — Set Up Project Infrastructure

**Owner:** Full-stack lead
**Output:** Running local dev environment + deployed scaffold on Vercel

Tasks:
- Create GitHub repo (private initially)
- Scaffold Next.js 14 project with App Router
- Install: Tailwind, shadcn/ui, Framer Motion, Privy/RainbowKit, Viem, Supabase client
- Set up Supabase project, create all tables from Step 4 schema
- Configure environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  ALCHEMY_API_KEY=
  X_CLIENT_ID=
  X_CLIENT_SECRET=
  DISCORD_CLIENT_ID=
  DISCORD_CLIENT_SECRET=
  VERIFIER_PRIVATE_KEY=
  ARC_RPC_URL=
  XP_REGISTRY_ADDRESS=
  NFT_CONTRACT_ADDRESS=
  ```
- Deploy empty scaffold to Vercel
- Connect custom domain

---

## PHASE 2 — SMART CONTRACTS
### Steps 6–10: The onchain backbone

---

### STEP 6 — Write XPRegistry.sol

**Owner:** Smart contract developer
**Network:** Arc testnet (Chain ID: confirm from docs.arc.network)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract XPRegistry {
    address public owner;
    address public verifier; // only your backend wallet can award XP

    mapping(address => uint256) public xpBalance;
    mapping(address => mapping(bytes32 => bool)) public completedTasks;
    mapping(address => uint8) public userLevel;

    uint256[] public levelThresholds = [0, 50, 200, 500, 1000];

    event XPAwarded(address indexed user, uint256 amount, bytes32 taskId);
    event LevelUp(address indexed user, uint8 newLevel);

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not authorized");
        _;
    }

    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }

    function awardXP(
        address user,
        uint256 amount,
        bytes32 taskId
    ) external onlyVerifier {
        require(!completedTasks[user][taskId], "Task already completed");
        completedTasks[user][taskId] = true;
        xpBalance[user] += amount;
        emit XPAwarded(user, amount, taskId);
        _checkLevelUp(user);
    }

    function _checkLevelUp(address user) internal {
        uint256 xp = xpBalance[user];
        uint8 newLevel = 1;
        for (uint8 i = 1; i < levelThresholds.length; i++) {
            if (xp >= levelThresholds[i]) newLevel = i + 1;
        }
        if (newLevel > userLevel[user]) {
            userLevel[user] = newLevel;
            emit LevelUp(user, newLevel);
        }
    }

    function getScore(address user) external view returns (uint256) {
        return xpBalance[user];
    }

    function hasCompletedTask(address user, bytes32 taskId) 
        external view returns (bool) {
        return completedTasks[user][taskId];
    }
}
```

---

### STEP 7 — Write ArcQuestNFT.sol

**Owner:** Smart contract developer

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ArcQuestNFT is ERC1155 {
    uint256 public constant BRONZE = 1; // soulbound
    uint256 public constant SILVER = 2; // soulbound
    uint256 public constant GOLD   = 3; // tradeable

    address public verifier;
    mapping(address => mapping(uint256 => bool)) public claimed;

    event NFTClaimed(address indexed user, uint256 tier);

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not authorized");
        _;
    }

    constructor(address _verifier) ERC1155("https://arcquest.xyz/api/nft/{id}") {
        verifier = _verifier;
    }

    function claimNFT(address user, uint256 tier) external onlyVerifier {
        require(!claimed[user][tier], "Already claimed");
        claimed[user][tier] = true;
        _mint(user, tier, 1, "");
        emit NFTClaimed(user, tier);
    }

    // Soulbound: block transfers for Bronze and Silver
    function safeTransferFrom(
        address from, address to, uint256 id, uint256 amount, bytes memory data
    ) public override {
        require(id == GOLD, "Only Gold NFTs are transferable");
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from, address to, uint256[] memory ids,
        uint256[] memory amounts, bytes memory data
    ) public override {
        for (uint i = 0; i < ids.length; i++) {
            require(ids[i] == GOLD, "Only Gold NFTs are transferable");
        }
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
}
```

---

### STEP 8 — Write TaskVerifier.sol (Optional Onchain Component)

**Owner:** Smart contract developer

This is a lightweight registry that records verified task completions onchain for transparency. Your backend calls this after verifying offchain.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskVerifier {
    address public verifier;

    struct Verification {
        address user;
        bytes32 taskId;
        uint256 verifiedAt;
        string taskType; // "onchain", "social", "quiz"
    }

    mapping(address => mapping(bytes32 => Verification)) public verifications;

    event TaskVerified(address indexed user, bytes32 taskId, string taskType);

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not authorized");
        _;
    }

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function recordVerification(
        address user,
        bytes32 taskId,
        string calldata taskType
    ) external onlyVerifier {
        require(verifications[user][taskId].verifiedAt == 0, "Already verified");
        verifications[user][taskId] = Verification(user, taskId, block.timestamp, taskType);
        emit TaskVerified(user, taskId, taskType);
    }
}
```

---

### STEP 9 — Write Contract Tests

**Owner:** Smart contract developer
**Framework:** Hardhat or Foundry

Test cases to cover:
- XP awarded correctly
- Cannot double-claim same task
- Level up triggers correctly at each threshold
- Non-verifier cannot award XP
- Bronze/Silver NFT blocks transfer
- Gold NFT allows transfer
- Cannot claim NFT twice
- Timestamp anchoring works correctly
- Rate limiting edge cases

Run full test suite. All tests must pass before deployment.

---

### STEP 10 — Deploy to Arc Testnet

**Owner:** Smart contract developer

Tasks:
- Get testnet USDC from faucet.circle.com (used for gas on Arc)
- Configure Hardhat/Foundry for Arc testnet RPC
- Deploy XPRegistry.sol → save contract address
- Deploy ArcQuestNFT.sol → save contract address
- Deploy TaskVerifier.sol → save contract address
- Verify all contracts on arcscan.app (Arc's Blockscout explorer)
- Update `.env` with all deployed addresses
- Test a live XP award transaction on testnet
- Document all addresses in `contracts.md`

---

## PHASE 3 — BACKEND
### Steps 11–16: The verification engine

---

### STEP 11 — Set Up API Structure

**Owner:** Backend developer
**Location:** `app/api/`

API routes to scaffold:

```
app/api/
├── auth/
│   ├── wallet/route.ts        # Wallet connect + session
│   └── callback/
│       ├── x/route.ts         # X OAuth callback
│       └── discord/route.ts   # Discord OAuth callback
├── user/
│   ├── profile/route.ts       # Get/update user profile
│   ├── xp/route.ts            # Get XP balance + history
│   └── tasks/route.ts         # Get user task statuses
├── tasks/
│   ├── start/route.ts         # Record task start timestamp
│   └── verify/route.ts        # Trigger verification
├── projects/
│   ├── route.ts               # List all projects
│   ├── [slug]/route.ts        # Single project + tasks
│   └── apply/route.ts         # Project application form
├── quiz/
│   ├── questions/route.ts     # Get quiz questions
│   └── submit/route.ts        # Submit quiz answer
├── leaderboard/route.ts       # Public leaderboard
└── admin/
    ├── applications/route.ts  # Review applications
    └── xp/route.ts            # Manual XP adjustment
```

Add to every API route:
- Rate limiting middleware (max 60 req/min per IP)
- Auth middleware (wallet session check where required)
- Error handling with consistent response format

---

### STEP 12 — Build Wallet Auth

**Owner:** Backend developer

Flow:
1. Frontend calls `eth_requestAccounts` → gets wallet address
2. Backend generates a nonce: `Sign this message to login to ArcQuest: [nonce]`
3. User signs message with wallet
4. Backend verifies signature → confirms wallet ownership
5. Create or fetch user record in Supabase
6. Issue session token (JWT or Supabase session)
7. If new user → redirect to display name setup
8. If returning user → redirect to dashboard

Display name rules:
- 3-20 characters
- Alphanumeric + underscores only
- Must be unique
- Cannot be changed for 30 days after setting

---

### STEP 13 — Build Onchain Task Verifier

**Owner:** Backend developer

```typescript
// lib/verifiers/onchain.ts

import { createPublicClient, http } from 'viem'
import { arcTestnet } from './chains'

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.ARC_RPC_URL)
})

export async function verifyOnchainTask({
  wallet,
  contractAddress,
  functionSig,
  startedAt,
  taskId
}: OnchainVerifyParams): Promise<boolean> {
  
  // Get recent transactions from wallet to contract
  const logs = await client.getLogs({
    address: contractAddress,
    fromBlock: await getBlockAtTimestamp(startedAt),
    toBlock: 'latest'
  })

  // Find matching transaction
  const match = logs.find(log => 
    log.topics[0]?.toLowerCase().includes(functionSig) &&
    log.transaction?.from.toLowerCase() === wallet.toLowerCase()
  )

  if (!match) return false

  // Call XPRegistry contract to award XP
  await awardXPOnchain(wallet, taskId)
  return true
}

// Retry logic — poll every 30s for up to 5 minutes
export async function verifyWithRetry(params: OnchainVerifyParams) {
  const maxAttempts = 10
  for (let i = 0; i < maxAttempts; i++) {
    const result = await verifyOnchainTask(params)
    if (result) return true
    await sleep(30000)
  }
  return false
}
```

---

### STEP 14 — Build X OAuth Integration

**Owner:** Backend developer

Flow:
1. User clicks "Connect X" → redirect to X OAuth 2.0 authorization URL
2. X redirects back to `/api/auth/callback/x` with auth code
3. Exchange code for access token
4. Fetch user ID + username from X API
5. Store `x_user_id` in users table (one wallet = one X account enforced)

Follow verification:
```typescript
// lib/verifiers/twitter.ts

export async function verifyXFollow(
  userAccessToken: string,
  targetUserId: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.twitter.com/2/users/me/following`,
    { headers: { Authorization: `Bearer ${userAccessToken}` } }
  )
  const data = await response.json()
  return data.data?.some((u: any) => u.id === targetUserId) ?? false
}
```

**MVP fallback (if X API cost is prohibitive):**
- User clicks "I followed" → screenshot upload field appears
- Admin reviews screenshots in admin panel
- Manual approve → XP awarded

---

### STEP 15 — Build Discord OAuth Integration

**Owner:** Backend developer

Flow:
1. User clicks "Connect Discord" → redirect to Discord OAuth URL
   - Scopes: `identify`, `guilds`
2. Discord redirects back to `/api/auth/callback/discord`
3. Exchange code for access token
4. Fetch user ID + guild memberships
5. Check if target server ID is in user's guilds
6. Award XP if member found

```typescript
// lib/verifiers/discord.ts

export async function verifyDiscordMembership(
  accessToken: string,
  targetServerId: string
): Promise<boolean> {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const guilds = await response.json()
  return guilds.some((g: any) => g.id === targetServerId)
}
```

This is completely free and instant. No API cost.

---

### STEP 16 — Build Quiz Engine

**Owner:** Backend developer

Quiz questions stored in your database (not exposed in frontend bundle).

API behavior:
- `GET /api/quiz/questions` → returns question 1 only (not all 10 at once, prevents cheating)
- `POST /api/quiz/submit` → submit answer for current question
  - Correct → return question 2
  - Wrong → record fail, return question 1 again
  - All 10 correct → award 20 XP, mark quiz as completed for this wallet

Rules enforced server-side:
- XP awarded exactly once per wallet (check `quiz_attempts` table)
- Retakes allowed unlimited times but XP only awarded on first pass
- Questions served in fixed order, not randomized (so users can learn)
- Answer options shuffled each attempt (prevents pattern memorization)

---

## PHASE 4 — FRONTEND CORE
### Steps 17–21: What users see

---

### STEP 17 — Build Homepage

**Owner:** Frontend developer
**Route:** `/`
**Key rule:** No wallet required anywhere on this page. Wallet connect is top right only — never forced.

---

#### NAVBAR

```
[ArcQuest Logo]                              [Connect Wallet]
```
- Logo links to `/`
- Wallet button: top right, subtle — not a hero CTA
- Transparent background at top, solid `#0a0a0f` when user scrolls down
- No hamburger menu on desktop — keep it minimal

---

#### PAGE LAYOUT (top to bottom)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NAVBAR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 1 — Get Started on Arc
  [3-slide independent carousel]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 2 — Verified Projects
  [3-slide independent carousel]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 3 — Community Projects
  [3-slide independent carousel]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STATS BAR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FOOTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

All three carousels are **independent** — each has its own auto-slide timer, its own dot indicators, its own arrow controls. They do not sync with each other.

---

#### CAROUSEL COMPONENT SPEC (reused for all 3 phases)

```typescript
// components/PhaseCarousel.tsx

Props:
- title: string           // Phase section heading
- subtitle: string        // Phase section subheading  
- slides: Slide[]         // Array of exactly 3 slides
- accentColor: string     // Purple / Cyan / Amber per phase
- autoInterval: number    // 3000ms

Behavior:
- Auto-advances every 3 seconds
- Resets timer on manual navigation
- Left arrow: go to previous slide (wraps from 1 → 3)
- Right arrow: go to next slide (wraps from 3 → 1)
- Dot click: jump to that slide directly
- Transition: slide content fades out (200ms) then new content fades in (200ms)
- Background gradient shifts subtly between slides within same phase

Dot indicator:
- 3 dots at bottom center of carousel
- Active dot: filled circle, accent color
- Inactive dots: hollow circle, muted
- Dots are clickable
```

---

#### PHASE 1 — Get Started on Arc

**Section header:**
```
Get Started on Arc
Everything you need to begin your Arc journey
```
Accent color: `#7B5EA7` Arc purple
Background: deep navy with slow purple glow animation

**Slide 1 of 3 — Learn About Arc**
```
[←]  ─────────────────────────────────  [→]

     📖  Learn About Arc

     Arc is Circle's stablecoin-native L1.
     USDC as gas. Sub-second finality.
     Built for the future of onchain finance.

     Read our guide and take the quiz
     to earn the highest single XP reward.

     [Read Arc Guide]    [Take Quiz → +20 XP]

              ●  ○  ○
```

**Slide 2 of 3 — Join the Community**
```
[←]  ─────────────────────────────────  [→]

     🐦  Join the ArcQuest Community

     Follow Arc, ArcQuest, and our founders
     to unlock the full quest board
     and start earning XP today.

     Mandatory onboarding tasks.
     Complete them to get started.

     [Connect Wallet to Begin]

              ○  ●  ○
```

**Slide 3 of 3 — Climb the Leaderboard**
```
[←]  ─────────────────────────────────  [→]

     🏆  Stand Tall in the Arc Ecosystem

     Complete tasks across every Arc protocol.
     Earn XP. Level up publicly.
     Claim NFTs that prove your journey.

     Top explorers this week:
     #1 CryptoKing  Lv5  2,400 XP
     #2 nald        Lv4    890 XP

     [View Full Leaderboard]

              ○  ○  ●
```

---

#### PHASE 2 — Verified Projects

**Section header:**
```
✓  Verified Arc Projects
Official protocols building on Arc. Use them. Earn XP doing it.
```
Accent color: `#00d4ff` electric cyan
Background: deep blue-black with cyan edge glow
No wallet required to browse — clicking [View Tasks →] goes to project page

**Slide 1 of 3 — First Verified Project (e.g. Aave)**
```
[←]  ─────────────────────────────────  [→]

     ✓ Official

     [Aave Logo]
     Aave on Arc

     The leading DeFi lending protocol
     now live on Arc testnet.
     Lend, borrow, and earn yield
     with deep stablecoin liquidity.

     3 tasks available  •  Up to 110 XP

     [View Tasks →]

              ●  ○  ○
```

**Slide 2 of 3 — Second Verified Project (e.g. Maple)**
```
[←]  ─────────────────────────────────  [→]

     ✓ Official

     [Maple Logo]
     Maple Finance on Arc

     Institutional lending infrastructure
     built for the onchain economy.
     Fixed-rate loans. Transparent credit.

     3 tasks available  •  Up to 65 XP

     [View Tasks →]

              ○  ●  ○
```

**Slide 3 of 3 — Third Verified Project (e.g. Curve)**
```
[←]  ─────────────────────────────────  [→]

     ✓ Official

     [Curve Logo]
     Curve Finance on Arc

     Stablecoin swaps with deep liquidity.
     The most efficient DEX for
     stable asset trading on Arc.

     2 tasks available  •  Up to 55 XP

     [View Tasks →]

              ○  ○  ●
```

---

#### PHASE 3 — Community Projects

**Section header:**
```
⚠️  Community Projects
Built by Arc builders. Stay informed. DYOR before interacting.
```
Accent color: `#f59e0b` amber
Background: deep charcoal with warm amber edge glow
Amber warning banner pinned to top of this entire section — always visible

**Warning banner (always shown, cannot dismiss):**
```
⚠️  These are community-submitted projects, not officially verified by Arc Network.
    Always do your own research before connecting your wallet to any community project.
```

**Slide 1 of 3 — First Community Project**
```
[←]  ─────────────────────────────────  [→]

     ⚠️ Community

     [Project Logo]
     Project Name

     Short description of what
     this project is building
     on Arc. 2-3 lines max.

     2 tasks available  •  Up to 40 XP

     [View Tasks →]

              ●  ○  ○
```

Slides 2 and 3 follow the same card format for the next two community projects.

---

#### STATS BAR

Below all three carousel sections. Full width. Dark background with subtle border top.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👥 2,341         ⚡ 48,920        ✅ 1,203        🏗️ 34
  Explorers        XP Earned       Tasks Done      Projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

All four numbers use count-up animation on page load (animate from 0 to real value over 1.5 seconds).
Numbers pulled from live Supabase queries — update every 5 minutes, cached.

---

#### FOOTER

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ArcQuest              Projects        Community
Arc Ecosystem Hub     Official        Discord
                      Community       X / Twitter
                      Apply           About Arc
                      
Built on Arc. Powered by the community.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### FLOATING "NEW TO ARC?" BUTTON

Fixed position, bottom-left corner of screen. Visible on homepage only.

On click → small drawer slides up from bottom:
```
╔══════════════════════════════╗
║  New to Arc?                 ║
║  ──────────────────────────  ║
║  Arc is Circle's L1 chain    ║
║  built for stablecoin        ║
║  finance. USDC as gas.       ║
║  Sub-second finality.        ║
║                              ║
║  [Read Full Guide →]         ║
║  [Take Quiz → +20 XP]        ║
╚══════════════════════════════╝
```

---

#### MOBILE BEHAVIOR

- All three carousels stack vertically (they already do — one per section)
- Swipe left/right on mobile to change slides (touch events)
- Arrow buttons hidden on mobile — swipe only
- Dots still visible and tappable
- Stats bar: 2×2 grid on mobile instead of 4 in a row
- Floating "New to Arc?" button moves to bottom-right on mobile

---

#### FRAMER MOTION IMPLEMENTATION NOTES

```typescript
// Slide transition
const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 }
}

// Stats count-up: use useMotionValue + animate on mount
// Level badge: spring animation on appear
// Carousel dots: scale(1.3) on active, smooth transition
```

Use `AnimatePresence` with `mode="wait"` for slide transitions.
Each carousel manages its own `currentSlide` state independently.

---

### STEP 18 — Build Onboarding Flow

**Owner:** Frontend developer
**Route:** `/onboarding`

Triggered automatically after first wallet connect + display name set.

Step-by-step flow (cannot skip):
1. Welcome screen — explain what ArcQuest is, what they'll earn
2. Set display name — input, availability check, confirm
3. Task: Follow Arc X — [Follow on X] button → opens X in new tab → [I Followed] → verify via X OAuth → +5 XP
4. Task: Follow ArcQuest X — same flow → +5 XP
5. Task: Follow Founder accounts — one by one → +5 XP each
6. Completion screen — show total XP earned, preview quest board
7. Redirect to `/dashboard`

Progress indicator at top: `Step 3 of 6`
Cannot navigate away during onboarding (soft lock with warning modal).

---

### STEP 19 — Build Dashboard

**Owner:** Frontend developer
**Route:** `/dashboard`

Layout:
```
[Sidebar]              [Main Content]
─────────              ──────────────
Home                   XP Progress Bar
Quests                 [████████░░] 87 / 200 XP to Lv3
Projects               
Leaderboard            [Lv2 Arc Builder Badge]
Profile                
                       Active Tasks (3)
                       ─────────────────
                       Aave: Deposit USDC    +50 XP  [Verify]
                       Maple: Follow on X    +5 XP   [Start]
                       Arc Quiz              +20 XP  [Start]

                       Recently Completed
                       ─────────────────
                       ✅ Follow Arc X        +5 XP
                       ✅ Join ArcQuest DC   +10 XP
```

XP bar always visible, updates immediately after task completion.
Notification bell in top right for: XP awarded, level up, NFT milestone reached.

---

### STEP 20 — Build Project Pages

**Owner:** Frontend developer
**Route:** `/projects/[slug]`

Page structure:
```
[Project Banner Image]
[Logo] Project Name    ✓ Official  OR  ⚠️ Community

Short description (2-3 lines max)

Links: [Website ↗]  [Twitter ↗]  [Discord ↗]

─────────────────────────────────────
Tasks                              XP
─────────────────────────────────────
🔗 Deposit USDC on Maple          +50 XP  [Start Task]
🐦 Follow @maple on X              +5 XP  [Verify]
💬 Join Maple Discord             +10 XP  [Verify]
─────────────────────────────────────

📊 234 people completed tasks this week
```

Task card states:
- `[Start Task]` → grey, not started
- `[In Progress]` → blue, started, waiting for user action
- `[Verifying...]` → yellow, backend polling
- `[✅ Completed]` → green, XP awarded, cannot restart

Community project pages show amber warning banner at top always.

---

### STEP 21 — Build Quiz Page

**Owner:** Frontend developer
**Route:** `/quiz`

Before quiz:
- Arc guide section — full explainer of Arc (written content)
- [Take the Quiz] button at bottom

During quiz:
```
Question 3 of 10

What consensus engine powers Arc?

○  Tendermint
○  Malachite     ← correct
○  Ethereum PoS
○  HotStuff

[Submit Answer]
```

Wrong answer state:
```
❌ Incorrect. Starting over from Question 1.
[Try Again]
```

All 10 correct state:
```
✅ Perfect Score!
You answered all 10 questions correctly.

+20 XP Awarded

[Go to Dashboard]  [Share on X]
```

Share on X pre-filled:
`Just passed the Arc Quiz on ArcQuest 🎯 +20 XP earned. Come learn → arcquest.xyz/quiz`

---

## PHASE 5 — FRONTEND SOCIAL
### Steps 22–25: Leaderboard, profiles, and rewards

---

### STEP 22 — Build Leaderboard

**Owner:** Frontend developer
**Route:** `/leaderboard`

```
Leaderboard

[This Week]  [All Time]  [By Project ▼]

─────────────────────────────────────────
Rank    Name          Level    XP
─────────────────────────────────────────
🥇 1    CryptoKing    Lv5 ★   2,400 XP
🥈 2    nald          Lv4      890 XP
🥉 3    Ludarep       Lv2      87 XP
   4    builder99     Lv2      74 XP
   5    arcfan        Lv1      45 XP
─────────────────────────────────────────
```

Rules:
- Display names only — no wallet addresses ever
- Level badge shown as icon next to name
- Paginated — show 20 per page
- Highlight current user's row if logged in
- Updates every 5 minutes (cached, not real-time)

---

### STEP 23 — Build Profile Page

**Owner:** Frontend developer
**Route:** `/u/[username]`

Public profile — anyone can view, no wallet required:
```
Ludarep
Lv2 Arc Builder  🥉

XP Progress:
[████████░░░░░░] 87 / 200 XP → Lv3

Tasks Completed: 6
NFTs Earned: 1
Global Rank: #142

─────────────────
NFT Gallery
[🥉 Bronze]

─────────────────
Recent Activity
✅ Deposited on Maple     +50 XP   2 days ago
✅ Joined ArcQuest DC    +10 XP   3 days ago
✅ Followed Arc X          +5 XP   3 days ago
```

Private info (only shown to wallet owner):
- Connected X account
- Connected Discord account
- Full task history

---

### STEP 24 — Build NFT Claim Flow

**Owner:** Frontend developer

Trigger: When user reaches 100 / 500 / 1000 XP threshold

Full-screen celebration modal:
```
╔══════════════════════════════════╗
║                                  ║
║    🎉  Milestone Reached!        ║
║                                  ║
║    [Bronze Badge Animation]      ║
║                                  ║
║    You've earned 100 XP          ║
║    Claim your Bronze Badge       ║
║                                  ║
║    [Claim NFT]                   ║
║                                  ║
║    [Share on X]                  ║
║                                  ║
╚══════════════════════════════════╝
```

Confetti animation on claim.

Share to X pre-filled:
`Just claimed my Bronze Badge on ArcQuest 🥉 Earning XP across the Arc ecosystem. Join me → arcquest.xyz`

After claim → NFT appears in profile gallery immediately.

---

### STEP 25 — Build Notification System

**Owner:** Frontend developer

Notification types:
- ✅ Task verified → XP awarded
- ⬆️ Level up → new level reached
- 🏅 NFT milestone → claim available
- 📢 New project listed (optional, user can toggle)

Implementation:
- Store notifications in Supabase `notifications` table
- Poll every 60 seconds (simple) OR use Supabase realtime (better)
- Bell icon in navbar with unread count badge
- Dropdown shows last 10 notifications
- Mark all as read on open

---

## PHASE 6 — ADMIN + PROJECTS
### Steps 26–28: Your control layer

---

### STEP 26 — Build Project Application Form

**Owner:** Frontend developer
**Route:** `/apply`

Form fields:
- Project name (required)
- Category: Official / Community
- Website URL
- X handle
- Discord server invite link
- Contract address on Arc (for onchain task verification)
- Short description (max 280 characters)
- Task list (up to 5 tasks, each with: title, type, XP value, instructions)
- Contact email
- Additional notes

On submit:
- Save to `applications` table with status `pending`
- Send confirmation email to contact email
- Show: "Application received. We review within 48 hours."

---

### STEP 27 — Build Admin Panel

**Owner:** Full-stack developer
**Route:** `/admin` (protected — only your wallet address)

Sections:

**Applications Queue:**
```
[Pending 3]  [Approved 12]  [Rejected 2]

─────────────────────────────────────
Project Name    Category    Submitted
─────────────────────────────────────
DeFi Protocol   Community   2 days ago   [Review] 
New AMM         Official    1 day ago    [Review]
─────────────────────────────────────
```

Review modal:
- Shows all application details
- [Approve as Official] / [Approve as Community] / [Reject]
- Rejection sends email with reason

**User Management:**
- Search by display name
- View XP history
- Manual XP adjustment (with reason logged)
- Flag/unflag account

**Platform Stats:**
- Total users
- Total XP distributed
- Most popular tasks
- Task completion rates per project

---

### STEP 28 — Build Project Dashboard

**Owner:** Full-stack developer
**Route:** `/dashboard/project` (for approved project contacts)

After approval, project contact gets access to:
```
Maple Finance Dashboard

Tasks Performance
─────────────────────────────────────
Task                Completions   XP Given
─────────────────────────────────────
Deposit USDC        234           11,700 XP
Follow on X         891            4,455 XP
Join Discord        445            4,450 XP
─────────────────────────────────────
Total Users Reached: 1,203

[Edit Task List →]  [View on ArcQuest →]
```

Read-only for now — they can view stats but task edits go through you.

---

## PHASE 7 — LAUNCH
### Steps 29–30: Go live

---

### STEP 29 — Testing and Security

**Owner:** All developers

Checklist before launch:

**Contract security:**
- [ ] Re-entrancy checks on all state-changing functions
- [ ] onlyVerifier tested with unauthorized wallets
- [ ] Double-claim attack tested and blocked
- [ ] Timestamp manipulation tested
- [ ] Gas estimation on all functions

**Backend security:**
- [ ] Rate limiting active on all API routes
- [ ] SQL injection impossible (parameterized queries only)
- [ ] Environment variables not exposed to frontend
- [ ] Admin routes protected by wallet check + server-side session

**Frontend:**
- [ ] Mobile responsive — all pages tested on 375px width
- [ ] Wallet connect works on mobile browsers
- [ ] All carousels auto-slide and manual slide on mobile
- [ ] No wallet addresses displayed anywhere public
- [ ] Community project warning visible on all relevant pages

**User flow testing:**
- [ ] Full onboarding flow from cold wallet
- [ ] X OAuth connect + follow verification
- [ ] Discord OAuth connect + membership verification
- [ ] Onchain task start → verify → XP awarded
- [ ] Quiz: pass flow, fail flow, retake flow, double XP attempt blocked
- [ ] NFT claim at 100 XP, 500 XP, 1000 XP
- [ ] Gold NFT transfer works, Bronze/Silver transfer blocked
- [ ] Leaderboard displays correctly — no addresses visible
- [ ] Admin panel approve/reject flow

---

### STEP 30 — Launch

**Owner:** Project lead (you)

Launch day checklist:

**Before going live:**
- [ ] At least 3 projects ready to list on day one (reach out to Arc ecosystem projects)
- [ ] Arc guide written and quiz questions loaded
- [ ] All founder X accounts added to onboarding follow list
- [ ] Domain live, SSL active
- [ ] Analytics set up (Vercel Analytics or Plausible)

**Launch posts:**

Post on Arc House (community.arc.network):
> ArcQuest is live on Arc testnet. The ecosystem hub for every protocol building on Arc. Complete tasks, earn XP, claim NFTs. First 100 users get early access. [link]

Post on X:
> ArcQuest is live 🚀 The first ecosystem quest hub for @arc Complete tasks across every Arc protocol. Earn XP. Level up. Claim NFTs. We're connecting the entire Arc ecosystem in one place. [link] #Arc #ArcQuest

**Growth actions day one:**
- DM 5 Arc ecosystem project founders to list their project
- Post in Arc Discord builders channel
- Share your personal ArcQuest profile link
- Engage with every comment and reply for first 48 hours

**First milestone targets:**
- Week 1: 100 registered users
- Week 2: 3+ projects listed
- Month 1: 500 users, 10 projects, 1 official Arc project listed

---

## Quick Reference

**Arc Testnet Details:**
- RPC: https://rpc.arc.network (confirm latest from docs.arc.network)
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com
- Chain ID: confirm from docs.arc.network/arc/references/connect-to-arc
- Gas token: USDC

**Key External Links:**
- Arc Docs: https://docs.arc.network
- Arc House: https://community.arc.network
- Arc X: https://x.com/arc
- Arc Discord: https://discord.com/invite/buildonarc

**Contact for project listing questions:**
- Admin: [your contact here]
- X: [@arcquest handle]

---

*ArcQuest — Built on Arc. For the Arc ecosystem.*
*Internal build document v1.0 — do not distribute publicly*