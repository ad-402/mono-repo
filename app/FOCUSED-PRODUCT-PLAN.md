# AD402: Crypto-Native Ad Network - Focused Product Plan

## 🎯 Vision
**The go-to ad network for Web3 projects that can't advertise on Google/Meta**

Target customers:
- DeFi protocols
- NFT marketplaces
- Crypto exchanges
- Web3 games
- Blockchain infrastructure
- Crypto media/news sites

---

## 🚀 Core Features (Next 8-12 Weeks)

### Phase 4: Real-Time Bidding (RTB) System
### Phase 5: Publisher/Advertiser Marketplace
### Phase 6: Crypto-Native Features

---

# PHASE 4: REAL-TIME BIDDING (RTB) 🔨

## What is RTB?

**Current system:**
```
Slot: "Header banner - 10 USDC for 1 hour" (fixed price, take it or leave it)
```

**RTB system:**
```
Slot: "Header banner - Starting at 5 USDC/hour"
├── Advertiser A bids: 7 USDC
├── Advertiser B bids: 9 USDC
├── Advertiser C bids: 12 USDC ← Winner!
└── Slot goes to highest bidder

Benefits:
- Publishers earn more (market price vs fixed)
- Advertisers get fair pricing
- Premium slots command premium prices
- Better inventory utilization
```

---

## RTB Implementation Plan

### 4.1: Auction Types (Start Simple)

**Option 1: Time-Based Slots** ✅ (Build this first)
```
Auction for 1-hour time slots
- Starts 24 hours before slot time
- Advertisers submit sealed bids
- Highest bid wins
- Second-price auction (pay what #2 bid + 0.01)
```

**Example:**
```
Slot: "CoinDesk.com header - Tomorrow 2pm-3pm EST"
Bids:
- Advertiser A: 15 USDC
- Advertiser B: 20 USDC
- Advertiser C: 18 USDC

Winner: Advertiser B
Pays: 18.01 USDC (second price + 0.01)
Saves: 1.99 USDC vs first-price
```

**Why second-price?**
- Advertisers bid their true value
- Reduces gaming/sniping
- Standard in ad industry

### 4.2: Auction Mechanism

**Smart Contract Structure:**
```solidity
contract AdSlotAuction {
    struct Auction {
        bytes32 slotId;
        uint256 startTime;
        uint256 endTime;
        uint256 reservePrice;  // Publisher's minimum
        address[] bidders;
        uint256[] bids;
        address winner;
        uint256 winningBid;
        AuctionStatus status;
    }

    enum AuctionStatus {
        Open,      // Accepting bids
        Closed,    // Bidding ended
        Finalized, // Winner determined
        Filled     // Ad is live
    }

    // Publisher creates auction
    function createAuction(
        bytes32 slotId,
        uint256 startTime,
        uint256 duration,
        uint256 reservePrice
    ) external;

    // Advertiser places bid
    function placeBid(bytes32 auctionId) external payable;

    // Finalize auction (can be automated)
    function finalizeAuction(bytes32 auctionId) external;

    // Refund losing bidders
    function refundBidders(bytes32 auctionId) internal;
}
```

### 4.3: Database Schema

**Add to Prisma:**
```prisma
model Auction {
  id            String   @id @default(cuid())
  slotId        String
  publisherId   String

  // Timing
  slotStartTime DateTime
  slotEndTime   DateTime
  biddingEndsAt DateTime

  // Pricing
  reservePrice  Decimal  @db.Decimal(10, 6)
  currentBid    Decimal? @db.Decimal(10, 6)

  // Status
  status        String   @default("open")

  // Relations
  publisher Publisher @relation(fields: [publisherId], references: [id])
  bids      Bid[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("auctions")
}

model Bid {
  id            String   @id @default(cuid())
  auctionId     String

  // Bidder info
  advertiserWallet String
  bidAmount        Decimal @db.Decimal(10, 6)

  // Status
  status        String   @default("pending")  // pending, winning, losing, refunded

  // Relations
  auction   Auction @relation(fields: [auctionId], references: [id])

  createdAt DateTime @default(now())

  @@map("bids")
}
```

### 4.4: API Endpoints

**Create Auction:**
```typescript
POST /api/auctions/create
{
  "slotId": "header-banner",
  "publisherWallet": "0x...",
  "slotStartTime": "2025-01-20T14:00:00Z",
  "duration": 60,  // minutes
  "reservePrice": "5.00"
}
```

**Place Bid:**
```typescript
POST /api/auctions/bid
{
  "auctionId": "auction-123",
  "advertiserWallet": "0x...",
  "bidAmount": "12.50",
  "adContentHash": "Qm...",  // IPFS hash of ad
  "transactionHash": "0x..."  // Payment transaction
}
```

**Get Active Auctions:**
```typescript
GET /api/auctions/active?slotId=header-banner

Response:
{
  "auctions": [
    {
      "id": "auction-123",
      "slotId": "header-banner",
      "publisher": "CoinDesk.com",
      "slotTime": "2025-01-20 14:00-15:00 EST",
      "currentBid": "12.50",
      "bidCount": 5,
      "endsIn": "2 hours",
      "reservePrice": "5.00"
    }
  ]
}
```

### 4.5: Bidding UX

**For Advertisers:**
```
1. Browse upcoming slots
   "CoinDesk.com - Header Banner"
   Tomorrow 2pm-3pm EST
   Reserve: 5 USDC
   Current bid: 8 USDC (3 bidders)

2. Place bid
   Your bid: [12.50] USDC
   [Submit Bid]

3. Get outbid notification
   "You've been outbid! New bid: 13 USDC"
   [Increase Bid]

4. Win auction
   "Congratulations! You won the slot"
   You pay: 12.51 USDC (second price)
   Upload your ad creative →
```

**For Publishers:**
```
1. Create auction schedule
   "Header banner"
   Schedule: Next 7 days, hourly slots
   Reserve price: 5 USDC/hour

2. Monitor bids
   Today 2pm slot: 5 bids, highest 12 USDC
   Today 3pm slot: 2 bids, highest 7 USDC

3. Auto-finalize
   Winning ads automatically displayed
   Revenue flows to your wallet
```

---

# PHASE 5: PUBLISHER/ADVERTISER MARKETPLACE 🏪

## What is the Marketplace?

**Problem:**
- Advertisers don't know which sites have inventory
- Publishers don't know which advertisers want their audience
- Discovery is manual and slow

**Solution:**
```
Marketplace = Directory + Search + Auto-matching

Publishers list:
├── Available slots
├── Traffic stats
├── Audience demographics
├── Pricing
└── Availability calendar

Advertisers search:
├── By niche (DeFi, NFT, Gaming)
├── By traffic volume
├── By geography
├── By price range
└── By audience quality
```

---

## 5.1: Publisher Profiles

**What Publishers List:**
```typescript
interface PublisherProfile {
  // Basic Info
  domain: string;
  name: string;
  description: string;
  category: string[];  // ["DeFi", "News", "Analytics"]

  // Traffic Stats (verified)
  monthlyVisitors: number;
  monthlyPageviews: number;
  avgSessionDuration: number;
  geography: {
    US: 40%,
    UK: 15%,
    EU: 25%,
    ASIA: 20%
  };

  // Audience
  audienceType: string[];  // ["Crypto traders", "DeFi users", "NFT collectors"]
  deviceBreakdown: {
    desktop: 60%,
    mobile: 35%,
    tablet: 5%
  };

  // Available Inventory
  adSlots: [
    {
      id: "header-banner",
      size: "728x90",
      position: "Above fold",
      avgImpressions: "50k/day",
      availableSlots: 20,  // Next 20 hours
      priceRange: "5-15 USDC/hour"
    }
  ];

  // Reputation
  rating: 4.8,
  totalCampaigns: 156,
  verifiedTraffic: true,
  fraudScore: 0.02  // Very low
}
```

### 5.2: Advertiser Dashboard

**Campaign Discovery Flow:**
```
1. Define campaign goals
   ├── Budget: 1000 USDC
   ├── Target: DeFi traders
   ├── Geography: US, UK
   └── Goal: 100k impressions

2. Browse matching publishers
   [Filters]
   Category: ☑ DeFi  ☑ News  ☐ NFT
   Min traffic: 100k/month
   Geography: US, UK, EU
   Price: 5-20 USDC/hour

   [Results - 24 publishers found]

   ✅ CoinDesk.com
      Category: News, DeFi
      Traffic: 2M/month
      Audience: Professional traders
      Available slots: Header (728x90)
      Price: 12-18 USDC/hour
      Rating: 4.9/5.0
      [Add to Campaign]

   ✅ DeFiPulse.com
      Category: DeFi, Analytics
      Traffic: 500k/month
      Audience: DeFi power users
      Available slots: Sidebar (160x600)
      Price: 8-12 USDC/hour
      Rating: 4.7/5.0
      [Add to Campaign]

3. Create multi-site campaign
   Selected publishers: 5
   Total reach: 500k impressions
   Total cost: 950 USDC
   [Launch Campaign]
```

### 5.3: Discovery & Search

**Publisher Directory:**
```
Categories:
├── DeFi (125 publishers)
├── NFT (89 publishers)
├── Gaming (67 publishers)
├── News (234 publishers)
├── Tools/Analytics (45 publishers)
└── Education (78 publishers)

Sort by:
├── Traffic (high to low)
├── Price (low to high)
├── Rating (high to low)
├── Availability (most slots)
└── Relevance
```

**Smart Recommendations:**
```
Based on your campaign targeting "DeFi traders in US":

Recommended publishers:
1. CoinDesk.com - High traffic, premium audience
2. DeFiLlama.com - Lower cost, engaged users
3. TheBlock.com - News-focused, trusted source

Similar campaigns achieved:
- 2.5% CTR
- $8 CPM average
- 1.2% conversion rate
```

### 5.4: Verification System

**Publisher Verification:**
```
To prevent fraud:

1. Domain Ownership
   └── DNS TXT record verification

2. Traffic Verification
   └── Google Analytics integration
   └── Or: Install verification pixel

3. Ad Placement Verification
   └── Screenshot proof of ad locations
   └── Or: Automated crawler check

Verification Levels:
├── Unverified (can list, lower visibility)
├── Domain Verified (✓)
├── Traffic Verified (✓✓)
└── Premium Verified (✓✓✓ - manual review)
```

### 5.5: Database Schema

```prisma
model PublisherProfile {
  id              String   @id @default(cuid())
  publisherId     String   @unique

  // Profile
  domain          String   @unique
  displayName     String
  description     String?
  logoUrl         String?
  categories      String[]

  // Traffic (verified)
  monthlyVisitors Int?
  monthlyPageviews Int?
  verifiedAt      DateTime?
  verificationMethod String?

  // Audience
  geography       Json?
  deviceBreakdown Json?
  audienceTypes   String[]

  // Reputation
  rating          Decimal? @db.Decimal(3, 2)
  totalCampaigns  Int     @default(0)
  fraudScore      Decimal? @db.Decimal(4, 3)

  // Verification
  verificationLevel String @default("unverified")
  verifiedTraffic   Boolean @default(false)

  publisher Publisher @relation(fields: [publisherId], references: [id])

  @@map("publisher_profiles")
}

model AdvertiserProfile {
  id              String   @id @default(cuid())
  walletAddress   String   @unique

  // Profile
  companyName     String?
  website         String?
  description     String?
  logoUrl         String?

  // Stats
  totalSpent      Decimal  @default(0) @db.Decimal(10, 6)
  totalCampaigns  Int      @default(0)
  avgCTR          Decimal? @db.Decimal(5, 2)

  // Reputation
  rating          Decimal? @db.Decimal(3, 2)

  @@map("advertiser_profiles")
}
```

---

# PHASE 6: CRYPTO-NATIVE FEATURES 🌐

## What Makes Us Crypto-Native?

Not just "accepts crypto payments" - we need features that **only make sense in crypto**.

### 6.1: Multi-Chain Campaign Management

**Feature:** Run campaigns across multiple chains/networks

```typescript
Campaign Configuration:
{
  name: "DeFi Protocol Launch",
  budget: "10000 USDC",

  targeting: {
    chains: ["ethereum", "polygon", "arbitrum", "base"],
    protocols: ["uniswap", "aave", "compound"],  // Target users of specific protocols
    walletActivity: "high-value-traders",  // On-chain behavior
    nftHolders: ["cryptopunks", "bayc"]  // NFT-based targeting
  },

  geo: {
    exclude: ["US"]  // Regulatory compliance
  }
}
```

**Why it's crypto-native:** Traditional ads can't target based on on-chain behavior

### 6.2: On-Chain Reputation & Proof

**Feature:** Cryptographic proof of ad performance

```solidity
contract AdPerformanceProof {
    struct Campaign {
        bytes32 campaignId;
        uint256 impressions;
        uint256 clicks;
        bytes32 merkleRoot;  // Root of all impression/click proofs
        uint256 timestamp;
    }

    // Publisher submits performance proof
    function submitProof(
        bytes32 campaignId,
        uint256 impressions,
        uint256 clicks,
        bytes32[] memory merkleProof
    ) external;

    // Anyone can verify
    function verifyPerformance(
        bytes32 campaignId,
        bytes32[] memory proof
    ) external view returns (bool);
}
```

**Benefits:**
- Advertisers can verify metrics independently
- Publishers can't fake impressions
- Transparent, on-chain reputation
- Disputes are provable

### 6.3: Smart Contract Escrow for Large Campaigns

**Feature:** Trustless multi-month campaigns

```
Traditional problem:
- Advertiser wants to run 3-month campaign
- Doesn't want to pay upfront
- Publisher doesn't want to show ads without payment

Crypto solution:
- Smart contract holds campaign budget
- Releases payment weekly based on performance
- Either party can trigger verification
- Disputes go to on-chain arbitration
```

**Implementation:**
```solidity
contract CampaignEscrow {
    struct Campaign {
        address advertiser;
        address publisher;
        uint256 totalBudget;
        uint256 released;
        uint256 startDate;
        uint256 endDate;
        PerformanceTarget target;
    }

    struct PerformanceTarget {
        uint256 minImpressions;
        uint256 minClicks;
        uint256 maxCost;
    }

    // Release payment if targets met
    function releasePayment(bytes32 campaignId, bytes32[] proof) external;

    // Dispute resolution
    function disputePerformance(bytes32 campaignId) external;
}
```

### 6.4: Wallet-Based Targeting (Privacy-Preserving)

**Feature:** Target specific on-chain behaviors WITHOUT doxxing users

```typescript
// Zero-knowledge proof of wallet activity
interface WalletProof {
  // User proves they have certain attributes without revealing wallet

  hasNFT: boolean;          // "I own a BAYC" (no wallet address revealed)
  tradingVolume: "high";     // "I trade >100k/month" (no amounts revealed)
  defiUser: boolean;         // "I use Aave/Compound" (no positions revealed)
  chainActivity: string[];   // "I'm active on Arbitrum" (no addresses revealed)
}

// Advertiser targets:
"Show ads to: DeFi users with >50k portfolio who trade NFTs"

// Matching happens client-side with ZK proofs
// No central database of user behaviors
```

**Why it matters:** Privacy-preserving targeting is crypto's killer feature

### 6.5: NFT-Gated Ad Slots

**Feature:** Premium slots only accessible to NFT holders

```
Example:
"Premium slot on CryptoPunks.com"
├── Only advertisers holding CryptoPunks can bid
├── Or: Hold our platform NFT to access
├── Or: Stake tokens to unlock premium inventory

Benefits:
├── Curated advertiser quality
├── Premium pricing
├── Community alignment
└── Speculation/trading on access rights
```

### 6.6: Cross-Protocol Analytics

**Feature:** Track user journey across Web3

```
User Journey Tracking (Privacy-Preserving):

1. User sees ad on DeFiLlama.com
   └── Anonymous ID generated

2. Clicks ad → lands on Uniswap.com
   └── Same anonymous ID (first-party cookie)

3. Swaps tokens on Uniswap
   └── Conversion pixel fires

4. Attribution:
   └── DeFiLlama gets credit for conversion
   └── Advertiser sees ROI
   └── No personal data collected

Implementation:
- First-party cookies only
- No cross-site tracking
- On-chain conversion proofs
- Zero-knowledge attribution
```

### 6.7: Instant Settlement

**Feature:** Real-time payment as ads perform

```
Current (Web2):
- Run ads for 30 days
- Wait 30-90 days for payment
- Payment processors take 5-10%

Crypto-native:
- Ads perform
- Smart contract pays publisher every hour
- No intermediary fees
- Instant liquidity

Example:
Hour 1: 1000 impressions → 0.5 USDC paid
Hour 2: 1200 impressions → 0.6 USDC paid
...
Real-time revenue!
```

### 6.8: Gasless Transactions for Small Ads

**Feature:** Meta-transactions for micro-campaigns

```
Problem: Gas fees for small campaigns don't make sense
- Want to spend 5 USDC on ads
- Gas fee: 2 USDC
- Not economical

Solution: Batch meta-transactions
- Collect 100 small campaigns
- Submit as one batch transaction
- Split gas cost: 0.02 USDC each
- Makes micro-campaigns viable
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Week 1-2: RTB Foundation
- [ ] Auction smart contracts (or off-chain with on-chain settlement)
- [ ] Database schema (Auction, Bid models)
- [ ] Create auction API
- [ ] Place bid API

### Week 3-4: RTB UI
- [ ] Auction browsing for advertisers
- [ ] Bid placement flow
- [ ] Auction management for publishers
- [ ] Automated auction finalization

### Week 5-6: Marketplace Foundation
- [ ] Publisher profiles (database + API)
- [ ] Publisher directory/search API
- [ ] Verification system
- [ ] Rating/reputation system

### Week 7-8: Marketplace UI
- [ ] Publisher directory page
- [ ] Profile creation for publishers
- [ ] Search/filter functionality
- [ ] Campaign builder (multi-publisher)

### Week 9-10: Crypto Features
- [ ] On-chain performance proofs
- [ ] Smart contract escrow
- [ ] Multi-chain support
- [ ] Privacy-preserving targeting (basic)

### Week 11-12: Polish & Launch
- [ ] Testing & bug fixes
- [ ] Documentation
- [ ] Onboarding flow
- [ ] Marketing site

---

## 📊 SUCCESS METRICS

**6 Months:**
- 50+ verified publishers
- 100+ active advertisers
- 1M+ daily impressions
- $50k+ monthly GMV

**12 Months:**
- 200+ verified publishers
- 500+ active advertisers
- 10M+ daily impressions
- $500k+ monthly GMV

---

## 🚀 GO-TO-MARKET

**Month 1: Seed the Supply Side**
- Manually onboard 20 crypto publishers
- CoinDesk, The Block, DeFiLlama, etc.
- Give them premium verification
- Guarantee minimum revenue

**Month 2: Seed the Demand Side**
- Reach out to 50 Web3 projects
- Offer first campaign free/discounted
- Focus on projects that can't advertise on Google

**Month 3: Scale**
- Open public marketplace
- Launch referral program
- Community building
- Content marketing

---

## 💰 PRICING STRATEGY

**Platform Fee:**
- 5% on all transactions
- Volume discounts:
  - >10k spend/month: 4%
  - >50k spend/month: 3%
  - >100k spend/month: 2%

**Premium Features:**
- Verified badge: Free (manual review)
- Featured listing: 50 USDC/month
- Analytics API access: 100 USDC/month
- White-label solution: Custom pricing

---

Ready to start building? Let's begin with **Phase 4: RTB System**!

Should we start with:
1. The auction smart contracts?
2. The database schema & API?
3. Or plan out the UI/UX first?

What's your preference?
