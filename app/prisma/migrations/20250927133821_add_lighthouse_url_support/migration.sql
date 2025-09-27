-- AlterTable
ALTER TABLE "public"."ad_content" ADD COLUMN     "lighthouse_url" TEXT,
ALTER COLUMN "file_path" DROP NOT NULL;
