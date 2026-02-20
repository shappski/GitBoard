-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "assignees" JSONB NOT NULL DEFAULT '[]';
