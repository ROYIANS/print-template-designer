ALTER TABLE "Template" ADD COLUMN "key" TEXT;

UPDATE "Template"
SET "key" = 'legacy_' || md5("id"::text || ':' || "createdAt"::text);

ALTER TABLE "Template" ALTER COLUMN "key" SET NOT NULL;

CREATE UNIQUE INDEX "Template_key_key" ON "Template"("key");

CREATE TABLE "DemoUserState" (
    "userId" TEXT NOT NULL,
    "resetDate" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DemoUserState_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "DemoUserState" ADD CONSTRAINT "DemoUserState_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
