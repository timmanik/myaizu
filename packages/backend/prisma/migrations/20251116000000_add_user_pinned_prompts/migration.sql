-- AlterTable
ALTER TABLE "users" ADD COLUMN "pinned_prompts" TEXT[] DEFAULT ARRAY[]::TEXT[];

