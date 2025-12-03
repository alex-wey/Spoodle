-- AlterTable: Make email optional and phone required with unique constraint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex: Add unique constraint on phone
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

