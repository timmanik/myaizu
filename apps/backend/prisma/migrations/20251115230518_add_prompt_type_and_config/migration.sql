-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('CHAT_PROMPT', 'CUSTOM_GPT', 'CLAUDE_PROJECT', 'GEMINI_GEM', 'CUSTOM_APP', 'OTHER');

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "additional_instructions" TEXT,
ADD COLUMN     "config" JSONB,
ADD COLUMN     "prompt_type" "PromptType" NOT NULL DEFAULT 'CHAT_PROMPT';
