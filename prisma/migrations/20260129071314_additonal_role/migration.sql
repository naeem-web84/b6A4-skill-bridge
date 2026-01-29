-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "status" TEXT DEFAULT 'Active';
