-- CreateTable
CREATE TABLE "public"."auctions" (
    "id" TEXT NOT NULL,
    "publisher_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "slot_start_time" TIMESTAMP(3) NOT NULL,
    "slot_end_time" TIMESTAMP(3) NOT NULL,
    "slot_duration" INTEGER NOT NULL,
    "bidding_starts_at" TIMESTAMP(3) NOT NULL,
    "bidding_ends_at" TIMESTAMP(3) NOT NULL,
    "reserve_price" DECIMAL(10,6) NOT NULL,
    "current_bid" DECIMAL(10,6),
    "final_price" DECIMAL(10,6),
    "winner_wallet" TEXT,
    "winning_bid_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "network" TEXT NOT NULL DEFAULT 'polygon',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bids" (
    "id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "advertiser_wallet" TEXT NOT NULL,
    "bid_amount" DECIMAL(10,6) NOT NULL,
    "ad_content_hash" TEXT NOT NULL,
    "ad_title" TEXT,
    "ad_description" TEXT,
    "click_url" TEXT,
    "transaction_hash" TEXT,
    "payment_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "refund_tx_hash" TEXT,
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auctions_status_bidding_ends_at_idx" ON "public"."auctions"("status", "bidding_ends_at");

-- CreateIndex
CREATE INDEX "auctions_slot_id_slot_start_time_idx" ON "public"."auctions"("slot_id", "slot_start_time");

-- CreateIndex
CREATE INDEX "bids_advertiser_wallet_idx" ON "public"."bids"("advertiser_wallet");

-- CreateIndex
CREATE INDEX "bids_auction_id_status_idx" ON "public"."bids"("auction_id", "status");

-- AddForeignKey
ALTER TABLE "public"."auctions" ADD CONSTRAINT "auctions_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bids" ADD CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
