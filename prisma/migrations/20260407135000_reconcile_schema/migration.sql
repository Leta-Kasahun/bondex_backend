-- DropIndex
DROP INDEX "admins_verificationToken_key";

-- DropIndex
DROP INDEX "users_verificationToken_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "emailVerified",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "lastLoginAt",
DROP COLUMN "lockedUntil",
DROP COLUMN "loginAttempts",
DROP COLUMN "verificationToken";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "verificationToken";

-- CreateTable
CREATE TABLE "admin_verifications" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationToken" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationToken" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_google_auths" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_google_auths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_verifications_adminId_key" ON "admin_verifications"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_verifications_verificationToken_key" ON "admin_verifications"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_adminId_key" ON "admin_sessions"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_refreshToken_key" ON "admin_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "admin_sessions_adminId_idx" ON "admin_sessions"("adminId");

-- CreateIndex
CREATE INDEX "admin_sessions_refreshToken_idx" ON "admin_sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_verifications_userId_key" ON "user_verifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_verifications_verificationToken_key" ON "user_verifications"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_otps_userId_key" ON "user_otps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_auths_userId_key" ON "user_google_auths"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_auths_googleId_key" ON "user_google_auths"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_otps_adminId_key" ON "admin_otps"("adminId");

-- AddForeignKey
ALTER TABLE "admin_verifications" ADD CONSTRAINT "admin_verifications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_google_auths" ADD CONSTRAINT "user_google_auths_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
