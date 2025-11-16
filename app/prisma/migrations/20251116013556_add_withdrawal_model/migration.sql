-- CreateTable
CREATE TABLE "public"."withdrawals" (
    "id" TEXT NOT NULL,
    "publisher_id" TEXT NOT NULL,
    "amount" DECIMAL(10,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "network" TEXT NOT NULL DEFAULT 'polygon',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "wallet_address" TEXT NOT NULL,
    "transaction_hash" TEXT,
    "failure_reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."withdrawals" ADD CONSTRAINT "withdrawals_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
