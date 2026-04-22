DO $$
BEGIN
  CREATE TYPE "SupportInquiryStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "SupportInquiry" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SupportInquiryStatus" NOT NULL DEFAULT 'OPEN',
  "adminNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "SupportInquiry_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SupportInquiry_userId_fkey'
  ) THEN
    ALTER TABLE "SupportInquiry"
      ADD CONSTRAINT "SupportInquiry_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "SupportInquiry_userId_idx" ON "SupportInquiry"("userId");
CREATE INDEX IF NOT EXISTS "SupportInquiry_status_createdAt_idx" ON "SupportInquiry"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "SupportInquiry_deletedAt_idx" ON "SupportInquiry"("deletedAt");
