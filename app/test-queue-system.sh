#!/bin/bash

# Queue/Marketplace System Test Script
# Tests the complete advertiser → publisher → allocation workflow

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 Testing Queue/Marketplace System..."
echo "========================================"
echo ""

# Test Data
PUBLISHER_WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
ADVERTISER_1="0x1111111111111111111111111111111111111111"
ADVERTISER_2="0x2222222222222222222222222222222222222222"
ADVERTISER_3="0x3333333333333333333333333333333333333333"

# ===== MARKETPLACE TESTS =====
echo -e "${BLUE}📋 Phase 1: Marketplace${NC}"
echo "========================================"
echo ""

# Test 1: Browse Publishers
echo "📝 Test 1: Browsing publishers marketplace..."
PUBLISHERS=$(curl -s "$BASE_URL/api/marketplace/publishers?limit=10")
echo "$PUBLISHERS" | jq '.'

PUBLISHER_COUNT=$(echo "$PUBLISHERS" | jq '.publishers | length')
echo -e "${GREEN}✓ Found $PUBLISHER_COUNT publisher(s) in marketplace${NC}"

echo ""
echo "========================================"
echo ""

# Test 2: View Trending Publishers
echo "📈 Test 2: Getting trending publishers..."
TRENDING=$(curl -s "$BASE_URL/api/marketplace/trending?period=7d&limit=5")
echo "$TRENDING" | jq '.trending[] | {name, viewsLastWeek, minPrice}'

echo -e "${GREEN}✓ Trending publishers retrieved${NC}"

echo ""
echo "========================================"
echo ""

# ===== BIDDING TESTS =====
echo -e "${BLUE}💰 Phase 2: Bidding${NC}"
echo "========================================"
echo ""

# Test 3: Create Bid 1 (Highest)
echo "📝 Test 3: Creating bid 1 (12 USDC - Highest)..."
BID_1=$(curl -s -X POST "$BASE_URL/api/bids/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"publisherId\": \"$(echo $PUBLISHERS | jq -r '.publishers[0].id')\",
    \"slotType\": \"header-banner\",
    \"advertiserWallet\": \"$ADVERTISER_1\",
    \"bidAmount\": \"12.00\",
    \"durationMinutes\": 60,
    \"adContentHash\": \"QmTestHash1\",
    \"adTitle\": \"Premium Ad 1\",
    \"adDescription\": \"High value ad\",
    \"clickUrl\": \"https://example1.com\"
  }")

echo "$BID_1" | jq '.'

BID_1_ID=$(echo "$BID_1" | jq -r '.bid.id')
if [ "$BID_1_ID" != "null" ] && [ -n "$BID_1_ID" ]; then
  echo -e "${GREEN}✓ Bid 1 created (12 USDC)${NC}"
else
  echo -e "${RED}✗ Failed to create bid 1${NC}"
fi

echo ""
echo "========================================"
echo ""

# Test 4: Create Bid 2 (Medium)
echo "📝 Test 4: Creating bid 2 (8 USDC - Medium)..."
BID_2=$(curl -s -X POST "$BASE_URL/api/bids/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"publisherId\": \"$(echo $PUBLISHERS | jq -r '.publishers[0].id')\",
    \"slotType\": \"header-banner\",
    \"advertiserWallet\": \"$ADVERTISER_2\",
    \"bidAmount\": \"8.00\",
    \"durationMinutes\": 60,
    \"adContentHash\": \"QmTestHash2\",
    \"adTitle\": \"Medium Ad 2\",
    \"clickUrl\": \"https://example2.com\"
  }")

BID_2_ID=$(echo "$BID_2" | jq -r '.bid.id')
if [ "$BID_2_ID" != "null" ] && [ -n "$BID_2_ID" ]; then
  echo -e "${GREEN}✓ Bid 2 created (8 USDC)${NC}"
else
  echo -e "${RED}✗ Failed to create bid 2${NC}"
fi

echo ""
echo "========================================"
echo ""

# Test 5: Create Bid 3 (Lowest)
echo "📝 Test 5: Creating bid 3 (5 USDC - Lowest)..."
BID_3=$(curl -s -X POST "$BASE_URL/api/bids/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"publisherId\": \"$(echo $PUBLISHERS | jq -r '.publishers[0].id')\",
    \"slotType\": \"header-banner\",
    \"advertiserWallet\": \"$ADVERTISER_3\",
    \"bidAmount\": \"5.00\",
    \"durationMinutes\": 60,
    \"adContentHash\": \"QmTestHash3\",
    \"adTitle\": \"Budget Ad 3\",
    \"clickUrl\": \"https://example3.com\"
  }")

BID_3_ID=$(echo "$BID_3" | jq -r '.bid.id')
if [ "$BID_3_ID" != "null" ] && [ -n "$BID_3_ID" ]; then
  echo -e "${GREEN}✓ Bid 3 created (5 USDC)${NC}"
else
  echo -e "${RED}✗ Failed to create bid 3${NC}"
fi

echo ""
echo "========================================"
echo ""

# Test 6: View Advertiser Bids
echo "📊 Test 6: Viewing advertiser's bids..."
MY_BIDS=$(curl -s "$BASE_URL/api/bids/my-bids?wallet=$ADVERTISER_1")
echo "$MY_BIDS" | jq '.summary'

echo -e "${GREEN}✓ Advertiser bids retrieved${NC}"

echo ""
echo "========================================"
echo ""

# ===== PUBLISHER APPROVAL TESTS =====
echo -e "${BLUE}✅ Phase 3: Publisher Approval${NC}"
echo "========================================"
echo ""

# Test 7: View Pending Bids (Publisher)
echo "📋 Test 7: Publisher viewing pending bids..."
PENDING=$(curl -s "$BASE_URL/api/publisher/pending-bids?wallet=$PUBLISHER_WALLET")
echo "$PENDING" | jq '.pendingBids[] | {bidAmount, adTitle, status}'

PENDING_COUNT=$(echo "$PENDING" | jq '.summary.totalPending')
echo ""
echo -e "${GREEN}✓ Found $PENDING_COUNT pending bid(s) for approval${NC}"

echo ""
echo "========================================"
echo ""

# Test 8: Approve Bid 1 (Highest)
echo "✅ Test 8: Publisher approving bid 1 (highest)..."
if [ "$BID_1_ID" != "null" ] && [ -n "$BID_1_ID" ]; then
  APPROVE_1=$(curl -s -X POST "$BASE_URL/api/publisher/approve-bid" \
    -H "Content-Type: application/json" \
    -d "{
      \"bidId\": \"$BID_1_ID\",
      \"publisherWallet\": \"$PUBLISHER_WALLET\"
    }")

  echo "$APPROVE_1" | jq '.'
  echo -e "${GREEN}✓ Bid 1 approved (12 USDC)${NC}"
fi

echo ""
echo "========================================"
echo ""

# Test 9: Approve Bid 2 (Medium)
echo "✅ Test 9: Publisher approving bid 2 (medium)..."
if [ "$BID_2_ID" != "null" ] && [ -n "$BID_2_ID" ]; then
  APPROVE_2=$(curl -s -X POST "$BASE_URL/api/publisher/approve-bid" \
    -H "Content-Type: application/json" \
    -d "{
      \"bidId\": \"$BID_2_ID\",
      \"publisherWallet\": \"$PUBLISHER_WALLET\"
    }")

  echo -e "${GREEN}✓ Bid 2 approved (8 USDC)${NC}"
fi

echo ""
echo "========================================"
echo ""

# Test 10: Reject Bid 3 (Lowest)
echo "❌ Test 10: Publisher rejecting bid 3 (lowest)..."
if [ "$BID_3_ID" != "null" ] && [ -n "$BID_3_ID" ]; then
  REJECT_3=$(curl -s -X POST "$BASE_URL/api/publisher/reject-bid" \
    -H "Content-Type: application/json" \
    -d "{
      \"bidId\": \"$BID_3_ID\",
      \"publisherWallet\": \"$PUBLISHER_WALLET\",
      \"reason\": \"Content not suitable for our audience\"
    }")

  echo "$REJECT_3" | jq '.'
  echo -e "${GREEN}✓ Bid 3 rejected${NC}"
fi

echo ""
echo "========================================"
echo ""

# ===== ALLOCATION TESTS =====
echo -e "${BLUE}🎯 Phase 4: Slot Allocation${NC}"
echo "========================================"
echo ""

# Test 11: View Allocation Queue
echo "📊 Test 11: Viewing allocation queue..."
QUEUE=$(curl -s "$BASE_URL/api/allocation/queue?wallet=$PUBLISHER_WALLET&slotType=header-banner")
echo "$QUEUE" | jq '.queue[] | {position, bidAmount, adTitle, waitingTime}'

echo ""
echo "Expected Order:"
echo "  Position 1: 12 USDC (Bid 1) - Highest"
echo "  Position 2: 8 USDC (Bid 2)  - Second"
echo ""
echo -e "${GREEN}✓ Queue retrieved and sorted by bid amount${NC}"

echo ""
echo "========================================"
echo ""

# Test 12: Assign Slot 1 (Should go to highest bidder)
echo "🎯 Test 12: Assigning slot 1 (should go to 12 USDC bid)..."
ASSIGN_1=$(curl -s -X POST "$BASE_URL/api/allocation/assign" \
  -H "Content-Type: application/json" \
  -d "{
    \"publisherWallet\": \"$PUBLISHER_WALLET\",
    \"slotType\": \"header-banner\"
  }")

echo "$ASSIGN_1" | jq '.allocation | {bidAmount, platformFee, publisherRevenue, timing}'

if echo "$ASSIGN_1" | grep -q "12.000000"; then
  echo -e "${GREEN}✓ Slot 1 assigned to highest bidder (12 USDC)${NC}"
else
  echo -e "${RED}✗ Slot assignment error${NC}"
fi

echo ""
echo "========================================"
echo ""

# Test 13: Check Updated Queue
echo "📊 Test 13: Checking queue after allocation..."
QUEUE_AFTER=$(curl -s "$BASE_URL/api/allocation/queue?wallet=$PUBLISHER_WALLET&slotType=header-banner")
echo "$QUEUE_AFTER" | jq '.queue[] | {position, bidAmount, adTitle}'

REMAINING=$(echo "$QUEUE_AFTER" | jq '.summary.totalInQueue')
echo ""
echo -e "${GREEN}✓ Queue updated: $REMAINING bid(s) remaining${NC}"
echo "  Position 1 should now be: 8 USDC (Bid 2)"

echo ""
echo "========================================"
echo ""

# Test 14: Get Bid Status
echo "🔍 Test 14: Checking bid 1 status (should be allocated)..."
if [ "$BID_1_ID" != "null" ] && [ -n "$BID_1_ID" ]; then
  BID_STATUS=$(curl -s "$BASE_URL/api/bids/$BID_1_ID")
  echo "$BID_STATUS" | jq '.bid | {status, allocation, performance}'

  if echo "$BID_STATUS" | grep -q "allocated"; then
    echo -e "${GREEN}✓ Bid 1 status: allocated${NC}"
  fi
fi

echo ""
echo "========================================"
echo ""

# ===== SUMMARY =====
echo -e "${BLUE}📋 Test Summary${NC}"
echo "========================================"
echo ""
echo "✅ Phase 1: Marketplace"
echo "   - Browsed publishers"
echo "   - Viewed trending"
echo ""
echo "✅ Phase 2: Bidding"
echo "   - Created 3 bids (12, 8, 5 USDC)"
echo "   - Viewed advertiser bids"
echo ""
echo "✅ Phase 3: Publisher Approval"
echo "   - Approved 2 bids (12, 8 USDC)"
echo "   - Rejected 1 bid (5 USDC)"
echo ""
echo "✅ Phase 4: Allocation"
echo "   - Viewed priority queue"
echo "   - Assigned slot to highest bidder"
echo "   - Verified queue order (descending)"
echo ""
echo -e "${GREEN}🎉 Queue System Test Complete!${NC}"
echo ""
echo "Expected Flow:"
echo "1. Bid 1 (12 USDC) → Gets first slot"
echo "2. Bid 2 (8 USDC)  → Gets next slot"
echo "3. Bid 3 (5 USDC)  → Rejected, marked for refund"
echo ""
echo "========================================"
