-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "recurrenceDaysOfWeek" TEXT,
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrencePattern" TEXT,
ADD COLUMN     "recurrenceTimes" TEXT,
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "tasks_recurring_idx" ON "tasks"("recurring");
