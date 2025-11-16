/*
  Warnings:

  - You are about to drop the column `lighthouse_url` on the `ad_content` table. All the data in the column will be lost.
  - Made the column `file_path` on table `ad_content` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."ad_content" DROP COLUMN "lighthouse_url",
ALTER COLUMN "file_path" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."storage_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "storage_config_key_key" ON "public"."storage_config"("key");
