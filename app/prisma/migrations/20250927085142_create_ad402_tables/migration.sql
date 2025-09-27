-- CreateTable
CREATE TABLE "public"."publishers" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "website_domain" TEXT,
    "email" TEXT,
    "name" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_slots" (
    "id" TEXT NOT NULL,
    "publisher_id" TEXT NOT NULL,
    "slot_identifier" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "base_price" DECIMAL(10,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "network" TEXT NOT NULL DEFAULT 'base',
    "duration_options" TEXT[],
    "category" TEXT,
    "moderation_level" TEXT NOT NULL DEFAULT 'medium',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "website_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_placements" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "publisher_id" TEXT NOT NULL,
    "advertiser_wallet" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_url" TEXT,
    "click_url" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "duration_minutes" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "moderation_status" TEXT NOT NULL DEFAULT 'pending',
    "moderation_notes" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_content" (
    "id" TEXT NOT NULL,
    "placement_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "placement_id" TEXT NOT NULL,
    "publisher_id" TEXT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "block_number" INTEGER,
    "amount" DECIMAL(10,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "network" TEXT NOT NULL DEFAULT 'base',
    "platform_fee" DECIMAL(10,6) NOT NULL,
    "publisher_revenue" DECIMAL(10,6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" TEXT NOT NULL,
    "placement_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "metadata" JSONB,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publishers_wallet_address_key" ON "public"."publishers"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "ad_slots_publisher_id_slot_identifier_key" ON "public"."ad_slots"("publisher_id", "slot_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "payments_placement_id_key" ON "public"."payments"("placement_id");

-- AddForeignKey
ALTER TABLE "public"."ad_slots" ADD CONSTRAINT "ad_slots_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_placements" ADD CONSTRAINT "ad_placements_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_placements" ADD CONSTRAINT "ad_placements_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_content" ADD CONSTRAINT "ad_content_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
