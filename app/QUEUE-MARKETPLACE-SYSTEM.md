# Ad402 Queue/Marketplace System

## Overview

Complete queue-based ad marketplace where **everyone gets a slot** based on priority. Higher bidders get earlier slots, lower bidders get later slots. No one is excluded!

---

## 🎯 How It Works

### **Key Concept: Priority Queue**

Instead of auctions where only the winner gets the slot, we use a **priority queue** where:
- ✅ Everyone who bids gets a slot eventually
- ✅ Higher bidders get better slots (earlier time, premium positions)
- ✅ Lower bidders get later slots
- ✅ Publishers approve/reject ads (content moderation)

---

## 🔄 Complete Workflow

### **1. Marketplace Discovery**
**Advertisers browse publishers on the marketplace:**

```bash
GET /api/marketplace/publishers
```

**Response:**
```json
{
  "publishers": [
    {
      "id": "pub_123",
      "name": "CryptoNews.com",
      "domain": "cryptonews.com",
      "stats": {
        "totalViews": 50000,
        "averageCTR": "2.50",
        "viewsLast7Days": 10000,
        "approvalRate": "95.0"
      },
      "slots": [
        {"id": "header-banner", "basePrice": "5.00"},
        {"id": "sidebar", "basePrice": "3.00"}
      ]
    }
  ]
}
```

**Features:**
- View trending publishers (most traffic last 7/30 days)
- See approval rates (how likely your ad gets approved)
- Browse available slot types
- Check minimum prices

---

### **2. Place Bid**
**Advertiser selects publisher + slot type and bids:**

```bash
POST /api/bids/create
```

**Request:**
```json
{
  "publisherId": "pub_123",
  "slotType": "header-banner",
  "advertiserWallet": "0x...",
  "bidAmount": "12.00",
  "durationMinutes": 60,
  "adContentHash": "QmXyz...",
  "adTitle": "Trade Crypto Now!",
  "clickUrl": "https://example.com",
  "transactionHash": "0x...",
  "network": "polygon"
}
```

**Response:**
```json
{
  "success": true,
  "bid": {
    "id": "bid_abc",
    "status": "pending_approval",
    "bidAmount": "12.000000",
    "paymentVerified": true
  },
  "message": "Bid created and awaiting publisher approval"
}
```

**Status:** `pending_approval` → Waiting for publisher to review

---

### **3. Publisher Reviews Bids**
**Publishers see pending bids sorted by amount (highest first):**

```bash
GET /api/publisher/pending-bids?wallet=0x...
```

**Response:**
```json
{
  "pendingBids": [
    {
      "id": "bid_abc",
      "bidAmount": "12.000000",
      "adTitle": "Trade Crypto Now!",
      "advertiser": "0x1111...1111",
      "status": "pending_approval"
    },
    {
      "id": "bid_def",
      "bidAmount": "8.000000",
      "adTitle": "NFT Marketplace",
      "status": "pending_approval"
    }
  ],
  "summary": {
    "totalPending": 2,
    "bySlotType": [
      {"slotType": "header-banner", "count": 2, "totalValue": "20.000000"}
    ]
  }
}
```

**Publishers can:**
- ✅ Approve ads (content is suitable)
- ❌ Reject ads (content not suitable, marked for refund)

---

### **4. Approve/Reject Bids**

**Approve:**
```bash
POST /api/publisher/approve-bid
{
  "bidId": "bid_abc",
  "publisherWallet": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "bid": {
    "status": "approved",
    "approvedAt": "2025-01-20T10:00:00Z",
    "queuePosition": 1
  }
}
```

**Reject:**
```bash
POST /api/publisher/reject-bid
{
  "bidId": "bid_def",
  "publisherWallet": "0x...",
  "reason": "Content not suitable"
}
```

**Status:** `approved` → Enters allocation queue

---

### **5. Allocation Queue**
**Approved bids enter priority queue (highest bid first):**

```bash
GET /api/allocation/queue?wallet=0x...&slotType=header-banner
```

**Response:**
```json
{
  "queue": [
    {
      "position": 1,
      "bidAmount": "12.000000",
      "adTitle": "Trade Crypto Now!",
      "durationMinutes": 60,
      "waitingTime": 5
    },
    {
      "position": 2,
      "bidAmount": "8.000000",
      "adTitle": "NFT Marketplace",
      "durationMinutes": 60,
      "waitingTime": 10
    },
    {
      "position": 3,
      "bidAmount": "5.000000",
      "adTitle": "Budget Ad",
      "durationMinutes": 30,
      "waitingTime": 15
    }
  ],
  "summary": {
    "totalInQueue": 3,
    "bySlotType": [...]
  }
}
```

**Queue Logic:**
1. **Sort by bid amount (descending)** - Highest bidders first
2. **Within same amount, FIFO** - Earlier approval gets priority
3. **All approved bids eventually get a slot**

---

### **6. Slot Assignment**
**When slot becomes available, assign to highest bidder:**

```bash
POST /api/allocation/assign
{
  "publisherWallet": "0x...",
  "slotType": "header-banner",
  "slotStartTime": "2025-01-20T14:00:00Z"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "allocation": {
    "bidId": "bid_abc",
    "placementId": "place_xyz",
    "advertiser": "0x1111...1111",
    "bidAmount": "12.000000",
    "platformFee": "0.600000",
    "publisherRevenue": "11.400000",
    "timing": {
      "startsAt": "2025-01-20T14:00:00Z",
      "expiresAt": "2025-01-20T15:00:00Z",
      "durationMinutes": 60
    }
  }
}
```

**What happens:**
- Bid removed from queue
- AdPlacement created
- Payment record created
- Publisher stats updated
- Bid status: `approved` → `allocated`

---

### **7. Track Performance**
**Advertisers can check bid status and performance:**

```bash
GET /api/bids/bid_abc
```

**Response:**
```json
{
  "bid": {
    "status": "allocated",
    "allocation": {
      "allocatedAt": "2025-01-20T13:00:00Z",
      "slotStart": "2025-01-20T14:00:00Z",
      "slotEnd": "2025-01-20T15:00:00Z"
    },
    "performance": {
      "views": 1250,
      "clicks": 45,
      "ctr": "3.60"
    },
    "queuePosition": null
  }
}
```

---

## 📊 Database Schema

### **Bid Model**
```prisma
model Bid {
  id          String   @id @default(cuid())

  // What they want
  publisherId String
  slotType    String  // "header-banner", "sidebar", etc.

  // Bidder
  advertiserWallet String
  bidAmount        Decimal
  durationMinutes  Int

  // Ad creative
  adContentHash String
  adTitle       String?
  adDescription String?
  clickUrl      String?

  // Payment
  transactionHash String?
  paymentVerified Boolean

  // Status: pending_approval → approved → allocated → running → completed
  status String @default("pending_approval")

  // Approval
  approvedAt      DateTime?
  approvedBy      String?
  rejectedAt      DateTime?
  rejectionReason String?

  // Allocation
  allocatedAt        DateTime?
  allocatedSlotStart DateTime?
  allocatedSlotEnd   DateTime?
  placementId        String? @unique

  // Relations
  publisher Publisher
  placement AdPlacement?
}
```

### **PublisherStats Model**
```prisma
model PublisherStats {
  id          String @id @default(cuid())
  publisherId String @unique

  // Traffic
  totalViews       Int
  totalClicks      Int
  averageCTR       Decimal

  // Revenue
  totalRevenue     Decimal
  averageSlotPrice Decimal

  // Activity
  activeSlotsCount Int
  totalAdsRun      Int

  // Trending
  viewsLast7Days  Int
  viewsLast30Days Int

  // Quality
  approvalRate Decimal  // % of bids approved
}
```

---

## 🔌 API Endpoints

### **Marketplace APIs**
```
GET  /api/marketplace/publishers    - Browse all publishers
GET  /api/marketplace/trending      - Trending publishers
```

### **Bidding APIs**
```
POST /api/bids/create              - Create a bid
GET  /api/bids/my-bids             - View advertiser's bids
GET  /api/bids/[bidId]             - Get bid status & performance
```

### **Publisher Dashboard APIs**
```
GET  /api/publisher/pending-bids   - View bids awaiting approval
POST /api/publisher/approve-bid    - Approve a bid
POST /api/publisher/reject-bid     - Reject a bid
```

### **Allocation APIs**
```
GET  /api/allocation/queue         - View allocation queue
POST /api/allocation/assign        - Assign slot to next bidder
```

---

## 💡 Key Features

### **1. Everyone Gets a Slot**
Unlike traditional auctions where losers get refunded:
- All approved bids eventually run
- Higher bidders get priority (earlier slots)
- Lower bidders just wait longer

### **2. Publisher Control**
Publishers can:
- Approve/reject ads (content moderation)
- See pending bids sorted by value
- View queue and decide when to allocate

### **3. Transparent Queue**
Both advertisers and publishers can:
- See queue position
- Check waiting time
- Know exactly when they'll run

### **4. Fair Pricing**
- Advertisers pay their bid amount (no second-price)
- Platform fee split (default 5%)
- Publisher gets majority of revenue

---

## 🔄 Status Lifecycle

**Bid Statuses:**
```
pending_approval  → Waiting for publisher to review
     ↓
approved         → In queue, waiting for slot
     ↓
allocated        → Slot assigned, will run soon
     ↓
running          → Currently displaying
     ↓
completed        → Finished running
     ↓
rejected         → Publisher rejected (refund)
```

---

## 🎯 Example Scenario

**Publisher: CryptoNews.com**
- Has 1 header-banner slot

**Three Advertisers Bid:**
1. Alice: 12 USDC for 60 minutes
2. Bob: 8 USDC for 60 minutes
3. Charlie: 5 USDC for 30 minutes

**Publisher Reviews:**
- Approves Alice ✅
- Approves Bob ✅
- Rejects Charlie ❌ (inappropriate content)

**Queue:**
```
Position 1: Alice (12 USDC)
Position 2: Bob (8 USDC)
```

**Allocation:**
- Slot 1 (2:00pm-3:00pm): Alice's ad runs
- Slot 2 (3:00pm-4:00pm): Bob's ad runs
- Charlie gets refunded

**Both Alice and Bob got a slot! Just at different times based on bid amount.**

---

## 🚀 Auto-Allocation (Future)

Can add cron job to automatically allocate slots:

```bash
# Every hour, check for available slots and auto-assign
GET /api/allocation/assign?wallet=0x...
```

This checks:
- Which slots are available (no active placement)
- If there are approved bids in queue
- Auto-assigns highest bidder

---

## 📈 Benefits Over Traditional RTB

| Feature | Traditional RTB | Queue System |
|---------|----------------|--------------|
| **Winners** | 1 (highest bidder) | Everyone approved |
| **Losers** | Get refunded | Get later slots |
| **Fairness** | Winner-takes-all | Priority-based |
| **Publisher Control** | Minimal | Full approval control |
| **Transparency** | Opaque | Clear queue position |
| **Pricing** | Second-price | Pay-your-bid |

---

## 🧪 Testing

Run the complete test script:

```bash
chmod +x test-queue-system.sh
./test-queue-system.sh
```

**Tests:**
1. ✅ Browse marketplace
2. ✅ Create multiple bids
3. ✅ Publisher approval/rejection
4. ✅ View queue (ordered by bid amount)
5. ✅ Slot allocation (highest bidder first)
6. ✅ Performance tracking

---

## 🎨 Next Steps: UI

**Week 2 - Build the UI:**

1. **Marketplace Page**
   - Browse publishers
   - Filter by category, traffic, price
   - View trending

2. **Bidding Interface**
   - Select publisher + slot
   - Submit bid with payment
   - Track bid status

3. **Publisher Dashboard**
   - Review pending bids
   - Approve/reject
   - View queue
   - Manage allocations

4. **Advertiser Dashboard**
   - My bids
   - Performance metrics
   - Queue position

---

## 📁 Files Created

**API Endpoints:**
- `app/api/marketplace/publishers/route.ts`
- `app/api/marketplace/trending/route.ts`
- `app/api/bids/create/route.ts`
- `app/api/bids/my-bids/route.ts`
- `app/api/bids/[bidId]/route.ts`
- `app/api/publisher/pending-bids/route.ts`
- `app/api/publisher/approve-bid/route.ts`
- `app/api/publisher/reject-bid/route.ts`
- `app/api/allocation/queue/route.ts`
- `app/api/allocation/assign/route.ts`

**Database:**
- Updated `prisma/schema.prisma` (Bid, PublisherStats models)

**Testing:**
- `test-queue-system.sh` - Complete workflow test

---

## ✅ System Complete!

**What we have:**
- ✅ Marketplace for browsing publishers
- ✅ Bidding system (everyone gets a slot)
- ✅ Publisher approval workflow
- ✅ Priority queue allocation
- ✅ Payment verification
- ✅ Performance tracking
- ✅ Complete API set

**Ready to build the UI! 🚀**
