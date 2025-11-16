# Phase 2: Revenue Tracking & Publisher Dashboard - COMPLETED ✅

## Summary

Publishers can now track their revenue, view transaction history, check analytics, and request withdrawals. Complete revenue tracking system implemented with platform fee splitting.

---

## What Was Built

### 1. Revenue Dashboard API Endpoints ✅

**Created 4 API Endpoints:**

#### `/api/publisher/revenue` - Revenue Overview
- Total earnings (all-time, this month, today)
- Available balance for withdrawal
- Total withdrawn amount
- Pending withdrawals
- Platform fees collected
- Earnings chart by date (last 30 days)

**Request:**
```
GET /api/publisher/revenue?walletAddress=0x...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalEarnings": "125.500000",
      "availableBalance": "100.250000",
      "totalWithdrawn": "20.000000",
      "pendingWithdrawals": "5.250000",
      "totalPlatformFees": "6.625000",
      "currency": "USDC"
    },
    "periodEarnings": {
      "today": "5.000000",
      "thisMonth": "45.500000",
      "allTime": "125.500000"
    },
    "chart": {
      "earningsByDate": {
        "2025-01-15": "5.50",
        "2025-01-14": "3.25"
      }
    }
  }
}
```

#### `/api/publisher/transactions` - Transaction History
- All payment transactions
- Filterable by status, date range
- Pagination support (limit/offset)
- Includes placement details

**Request:**
```
GET /api/publisher/transactions?walletAddress=0x...&limit=50&offset=0
```

**Features:**
- Filter by status: `pending`, `confirmed`, `failed`
- Date range filtering
- Pagination (50 per page default)
- Includes ad placement info for each transaction

#### `/api/publisher/analytics` - Performance Analytics
- Total views, clicks, revenue
- Click-through rate (CTR)
- Revenue per mille (RPM)
- Cost per click (CPC)
- Top performing slots
- Performance trends over time

**Request:**
```
GET /api/publisher/analytics?walletAddress=0x...&slotId=header-banner
```

**Response Metrics:**
```json
{
  "overview": {
    "totalViews": 15000,
    "totalClicks": 450,
    "totalRevenue": "125.500000",
    "ctr": "3.00",
    "rpm": "8.366667",
    "cpc": "0.278889"
  },
  "topSlots": [...]
}
```

#### `/api/publisher/withdraw` - Withdrawal Management
- **POST**: Request withdrawal
- **GET**: View withdrawal history

**Request Withdrawal:**
```json
POST /api/publisher/withdraw
{
  "walletAddress": "0x...",
  "amount": "50.00",
  "currency": "USDC",
  "network": "polygon"
}
```

**Validations:**
- Minimum withdrawal: 10 USDC
- Sufficient balance check
- Rate limiting applied
- Auto-calculates withdrawal fees

---

### 2. Withdrawal System ✅

**Database Model Created:**
```prisma
model Withdrawal {
  id              String    @id
  publisherId     String
  amount          Decimal
  currency        String    @default("USDC")
  network         String    @default("polygon")
  status          String    @default("pending")
  walletAddress   String
  transactionHash String?
  failureReason   String?
  requestedAt     DateTime
  processedAt     DateTime?
}
```

**Withdrawal Statuses:**
- `pending` - Awaiting processing
- `processing` - Being processed
- `completed` - Successfully sent
- `failed` - Failed with reason

**Features:**
- Minimum withdrawal amount (configurable)
- Balance validation
- Fee calculation
- Transaction history
- Status tracking

---

### 3. Platform Fee Implementation ✅

**Fee Splitting Logic:**
```typescript
// In upload-ad/route.ts
const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
const platformFee = (amount * platformFeePercentage) / 100;
const publisherRevenue = amount - platformFee;
```

**Configuration:**
Set in `.env`:
```bash
PLATFORM_FEE_PERCENTAGE=5  # 5% platform fee
WITHDRAWAL_FEE_PERCENTAGE=0  # Optional withdrawal fee
```

**Example:**
- Advertiser pays: 10 USDC
- Platform fee (5%): 0.50 USDC
- Publisher earns: 9.50 USDC

**Database Records:**
Every payment now stores:
- `amount` - Total paid by advertiser
- `platformFee` - Fee taken by platform
- `publisherRevenue` - Amount publisher earns

---

### 4. Enhanced Upload-Ad Endpoint ✅

**Now includes:**
- Payment verification (from Phase 1)
- Platform fee calculation
- Database persistence:
  - Creates/updates Publisher record
  - Saves AdPlacement record
  - Saves Payment record
- Returns detailed response with fee breakdown

**Response Example:**
```json
{
  "success": true,
  "placement": {
    "id": "placement-xyz",
    "hash": "stored-placement-...",
    "contentUrl": "https://gateway.lighthouse.storage/ipfs/...",
    "startsAt": "2025-01-15T10:00:00Z",
    "expiresAt": "2025-01-15T11:00:00Z",
    "status": "active"
  },
  "payment": {
    "id": "payment-abc",
    "transactionHash": "0x123...",
    "amount": "10.000000",
    "platformFee": "0.500000",
    "publisherRevenue": "9.500000",
    "currency": "USDC"
  }
}
```

---

## Database Changes

### New Model:
- **Withdrawal** - Tracks withdrawal requests and processing

### Updated Models:
- **Publisher** - Added `withdrawals` relation
- **AdPlacement** - Now saved to database (was only in Lighthouse before)
- **Payment** - Now saved with every ad upload

### Migration:
```bash
npx prisma migrate dev --name add_withdrawal_model
```

---

## Environment Variables

### Added:
```bash
# Platform fee (percentage)
PLATFORM_FEE_PERCENTAGE=5

# Optional: Withdrawal fee (percentage)
WITHDRAWAL_FEE_PERCENTAGE=0
```

---

## API Usage Examples

### Get Publisher Revenue
```bash
curl "http://localhost:3000/api/publisher/revenue?walletAddress=0x123..."
```

### Get Transaction History
```bash
curl "http://localhost:3000/api/publisher/transactions?walletAddress=0x123...&limit=10"
```

### Request Withdrawal
```bash
curl -X POST http://localhost:3000/api/publisher/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x123...",
    "amount": "50.00"
  }'
```

### Get Analytics
```bash
curl "http://localhost:3000/api/publisher/analytics?walletAddress=0x123..."
```

---

## Features Implemented

### ✅ Revenue Tracking
- Automatic tracking of all payments
- Platform fee calculation and splitting
- Historical earnings data
- Period-based reporting (today, this month, all-time)

### ✅ Withdrawal System
- Request withdrawals
- Minimum amount validation
- Balance checking
- Withdrawal history
- Status tracking

### ✅ Analytics
- View counts per placement
- Click tracking
- CTR calculation
- RPM (Revenue per thousand impressions)
- CPC (Cost per click)
- Top performing slots

### ✅ Transaction Management
- Complete transaction history
- Filter by date, status
- Pagination support
- Placement details included

---

## Security Features

- ✅ Rate limiting on withdrawal requests
- ✅ Balance validation before withdrawal
- ✅ Minimum withdrawal amount
- ✅ CORS protection
- ✅ Input validation

---

## What's Next (Optional Enhancements)

### Dashboard UI (Phase 2.4-2.5)
- Create `/app/dashboard` route
- Revenue overview cards
- Earnings charts
- Transaction tables
- Analytics visualizations

### Withdrawal Processing
- Admin interface for processing withdrawals
- Automated withdrawal processing
- Email notifications

### Advanced Analytics
- Geographic breakdown
- Time-based analytics
- A/B testing metrics
- Conversion tracking

---

## Testing

### Test Revenue API
```bash
# Create a publisher by uploading an ad
# Then check revenue
curl "http://localhost:3000/api/publisher/revenue?walletAddress=YOUR_WALLET"
```

### Test Withdrawal
```bash
# Request withdrawal
curl -X POST http://localhost:3000/api/publisher/withdraw \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"YOUR_WALLET","amount":"10.00"}'
```

---

## Files Created

**API Routes:**
- `app/api/publisher/revenue/route.ts`
- `app/api/publisher/transactions/route.ts`
- `app/api/publisher/analytics/route.ts`
- `app/api/publisher/withdraw/route.ts`

**Database:**
- `prisma/migrations/.../add_withdrawal_model/`

**Modified:**
- `app/api/upload-ad/route.ts` - Added database persistence and fee splitting
- `app/api/queue-info/[slotId]/route.ts` - Removed fallback storage
- `prisma/schema.prisma` - Added Withdrawal model

---

## Revenue Flow

```
Advertiser pays 10 USDC
       ↓
Payment verified on blockchain
       ↓
Platform fee calculated (5% = 0.50 USDC)
       ↓
Publisher earns 9.50 USDC
       ↓
Saved to database:
  - Payment record (amount, fees, revenue)
  - AdPlacement record
       ↓
Publisher can:
  - View earnings in /api/publisher/revenue
  - Request withdrawal when balance ≥ 10 USDC
  - Track analytics in /api/publisher/analytics
```

---

## Platform Economics

| Action | Amount | Platform Fee | Publisher Earns |
|--------|--------|--------------|-----------------|
| Ad purchased | 10 USDC | 0.50 USDC (5%) | 9.50 USDC |
| Ad purchased | 50 USDC | 2.50 USDC (5%) | 47.50 USDC |
| Ad purchased | 100 USDC | 5.00 USDC (5%) | 95.00 USDC |

**Withdrawal:**
- Minimum: 10 USDC
- Fee: Configurable (default 0%)
- Processing time: 24-48 hours

---

🎉 **Phase 2 Complete!** Publishers can now track revenue and request withdrawals!

**Next:** Build the dashboard UI (optional) or move to other phases.
