-- CreateEnum
CREATE TYPE "PromptVisibility" AS ENUM ('PUBLIC', 'TEAM', 'PRIVATE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('CHATGPT', 'CLAUDE', 'GEMINI', 'COPILOT', 'MIDJOURNEY', 'STABLE_DIFFUSION', 'OTHER');

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "variables" JSONB,
    "platform" "Platform" NOT NULL DEFAULT 'OTHER',
    "visibility" "PromptVisibility" NOT NULL DEFAULT 'PRIVATE',
    "tags" TEXT[],
    "author_id" TEXT NOT NULL,
    "team_id" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "copy_count" INTEGER NOT NULL DEFAULT 0,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompts_author_id_idx" ON "prompts"("author_id");

-- CreateIndex
CREATE INDEX "prompts_platform_idx" ON "prompts"("platform");

-- CreateIndex
CREATE INDEX "prompts_visibility_idx" ON "prompts"("visibility");

-- CreateIndex
CREATE INDEX "prompts_created_at_idx" ON "prompts"("created_at");

-- CreateIndex
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

-- CreateIndex
CREATE INDEX "favorites_prompt_id_idx" ON "favorites"("prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_prompt_id_key" ON "favorites"("user_id", "prompt_id");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
