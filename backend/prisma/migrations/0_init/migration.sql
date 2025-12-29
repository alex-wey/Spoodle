-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet_owners" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "clinicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "biologicalSex" TEXT,
    "breed" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "spayedNeutered" BOOLEAN NOT NULL DEFAULT false,
    "allergies" TEXT[],
    "dietaryRestrictions" TEXT[],
    "imageUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "petId" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_reports" (
    "id" TEXT NOT NULL,
    "petOwnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "appVersion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "petOwnerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isFromUser" BOOLEAN NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "petOwnerId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "biometricAuth" BOOLEAN NOT NULL DEFAULT false,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "clinicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "completedByName" TEXT,
    "notes" TEXT,
    "carePlanId" TEXT,
    "reminderId" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrencePattern" TEXT,
    "recurrenceDaysOfWeek" TEXT,
    "recurrenceEndDate" TIMESTAMP(3),
    "recurrenceTimes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "pet_owners_clerkUserId_key" ON "pet_owners"("clerkUserId");

-- CreateIndex
CREATE INDEX "pets_ownerId_idx" ON "pets"("ownerId");

-- CreateIndex
CREATE INDEX "bug_reports_category_idx" ON "bug_reports"("category");

-- CreateIndex
CREATE INDEX "bug_reports_petOwnerId_idx" ON "bug_reports"("petOwnerId");

-- CreateIndex
CREATE INDEX "bug_reports_severity_idx" ON "bug_reports"("severity");

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "bug_reports"("status");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_petOwnerId_idx" ON "chat_messages"("petOwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_petOwnerId_key" ON "settings"("petOwnerId");

-- CreateIndex
CREATE INDEX "settings_petOwnerId_idx" ON "settings"("petOwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_clerkOrgId_key" ON "clinics"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE INDEX "clinics_clerkOrgId_idx" ON "clinics"("clerkOrgId");

-- CreateIndex
CREATE INDEX "clinics_slug_idx" ON "clinics"("slug");

-- CreateIndex
CREATE INDEX "pet_owners_clinicId_idx" ON "pet_owners"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_clerkUserId_key" ON "staff"("clerkUserId");

-- CreateIndex
CREATE INDEX "staff_clinicId_idx" ON "staff"("clinicId");

-- CreateIndex
CREATE INDEX "tasks_petId_idx" ON "tasks"("petId");

-- CreateIndex
CREATE INDEX "tasks_scheduledDate_idx" ON "tasks"("scheduledDate");

-- CreateIndex
CREATE INDEX "tasks_completed_idx" ON "tasks"("completed");

-- CreateIndex
CREATE INDEX "tasks_taskType_idx" ON "tasks"("taskType");

-- CreateIndex
CREATE INDEX "tasks_recurring_idx" ON "tasks"("recurring");

-- AddForeignKey
ALTER TABLE "pet_owners" ADD CONSTRAINT "pet_owners_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "users"("clerkUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_owners" ADD CONSTRAINT "pet_owners_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "pet_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "pet_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "pet_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_petOwnerId_fkey" FOREIGN KEY ("petOwnerId") REFERENCES "pet_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "users"("clerkUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
