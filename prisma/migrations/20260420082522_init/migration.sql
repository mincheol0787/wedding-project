-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('INVITATION', 'VIDEO');

-- CreateEnum
CREATE TYPE "TemplateTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FONT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "VideoSceneType" AS ENUM ('INTRO', 'PHOTO', 'TEXT', 'GALLERY', 'OUTRO');

-- CreateEnum
CREATE TYPE "RenderJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ATTENDING', 'NOT_ATTENDING', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "GuestSide" AS ENUM ('GROOM', 'BRIDE', 'BOTH', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WeddingProject" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "groomName" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3),
    "venueName" TEXT,
    "venueAddress" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WeddingProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL,
    "tier" "TemplateTier" NOT NULL DEFAULT 'FREE',
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "previewUrl" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProject" (
    "id" TEXT NOT NULL,
    "weddingProjectId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL DEFAULT 60,
    "width" INTEGER NOT NULL DEFAULT 1920,
    "height" INTEGER NOT NULL DEFAULT 1080,
    "fps" INTEGER NOT NULL DEFAULT 30,
    "musicAssetId" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationProject" (
    "id" TEXT NOT NULL,
    "weddingProjectId" TEXT NOT NULL,
    "templateId" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'DRAFT',
    "publicSlug" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "greeting" TEXT,
    "groomFatherName" TEXT,
    "groomMotherName" TEXT,
    "brideFatherName" TEXT,
    "brideMotherName" TEXT,
    "contactPhoneGroom" TEXT,
    "contactPhoneBride" TEXT,
    "eventDate" TIMESTAMP(3),
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueDetail" TEXT,
    "mapProvider" TEXT,
    "mapLat" DECIMAL(10,7),
    "mapLng" DECIMAL(10,7),
    "coverAssetId" TEXT,
    "gallery" JSONB,
    "rsvpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "guestbookEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InvitationProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "weddingProjectId" TEXT,
    "type" "MediaType" NOT NULL,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'PRIVATE',
    "storageKey" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "url" TEXT,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" DOUBLE PRECISION,
    "altText" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoScene" (
    "id" TEXT NOT NULL,
    "videoProjectId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "type" "VideoSceneType" NOT NULL DEFAULT 'PHOTO',
    "order" INTEGER NOT NULL,
    "startMs" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "transition" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VideoScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LyricSegment" (
    "id" TEXT NOT NULL,
    "videoProjectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "style" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LyricSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weddingProjectId" TEXT NOT NULL,
    "videoProjectId" TEXT NOT NULL,
    "outputAssetId" TEXT,
    "status" "RenderJobStatus" NOT NULL DEFAULT 'QUEUED',
    "queueJobId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "input" JSONB NOT NULL,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "invitationProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "side" "GuestSide" NOT NULL DEFAULT 'UNKNOWN',
    "attendance" "AttendanceStatus" NOT NULL DEFAULT 'UNDECIDED',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "mealOption" TEXT,
    "message" TEXT,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guestbook" (
    "id" TEXT NOT NULL,
    "invitationProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "message" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Guestbook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "WeddingProject_ownerId_status_idx" ON "WeddingProject"("ownerId", "status");

-- CreateIndex
CREATE INDEX "WeddingProject_weddingDate_idx" ON "WeddingProject"("weddingDate");

-- CreateIndex
CREATE INDEX "WeddingProject_deletedAt_idx" ON "WeddingProject"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingProject_ownerId_slug_key" ON "WeddingProject"("ownerId", "slug");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE INDEX "ProjectMember_deletedAt_idx" ON "ProjectMember"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_key_key" ON "Template"("key");

-- CreateIndex
CREATE INDEX "Template_type_tier_isActive_idx" ON "Template"("type", "tier", "isActive");

-- CreateIndex
CREATE INDEX "Template_sortOrder_idx" ON "Template"("sortOrder");

-- CreateIndex
CREATE INDEX "Template_deletedAt_idx" ON "Template"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoProject_weddingProjectId_key" ON "VideoProject"("weddingProjectId");

-- CreateIndex
CREATE INDEX "VideoProject_templateId_idx" ON "VideoProject"("templateId");

-- CreateIndex
CREATE INDEX "VideoProject_musicAssetId_idx" ON "VideoProject"("musicAssetId");

-- CreateIndex
CREATE INDEX "VideoProject_deletedAt_idx" ON "VideoProject"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationProject_weddingProjectId_key" ON "InvitationProject"("weddingProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationProject_publicSlug_key" ON "InvitationProject"("publicSlug");

-- CreateIndex
CREATE INDEX "InvitationProject_status_publishedAt_idx" ON "InvitationProject"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "InvitationProject_templateId_idx" ON "InvitationProject"("templateId");

-- CreateIndex
CREATE INDEX "InvitationProject_coverAssetId_idx" ON "InvitationProject"("coverAssetId");

-- CreateIndex
CREATE INDEX "InvitationProject_deletedAt_idx" ON "InvitationProject"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_ownerId_type_idx" ON "MediaAsset"("ownerId", "type");

-- CreateIndex
CREATE INDEX "MediaAsset_weddingProjectId_type_idx" ON "MediaAsset"("weddingProjectId", "type");

-- CreateIndex
CREATE INDEX "MediaAsset_visibility_idx" ON "MediaAsset"("visibility");

-- CreateIndex
CREATE INDEX "MediaAsset_deletedAt_idx" ON "MediaAsset"("deletedAt");

-- CreateIndex
CREATE INDEX "VideoScene_videoProjectId_startMs_idx" ON "VideoScene"("videoProjectId", "startMs");

-- CreateIndex
CREATE INDEX "VideoScene_mediaAssetId_idx" ON "VideoScene"("mediaAssetId");

-- CreateIndex
CREATE INDEX "VideoScene_deletedAt_idx" ON "VideoScene"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoScene_videoProjectId_order_key" ON "VideoScene"("videoProjectId", "order");

-- CreateIndex
CREATE INDEX "LyricSegment_videoProjectId_startMs_idx" ON "LyricSegment"("videoProjectId", "startMs");

-- CreateIndex
CREATE INDEX "LyricSegment_deletedAt_idx" ON "LyricSegment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LyricSegment_videoProjectId_order_key" ON "LyricSegment"("videoProjectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "RenderJob_queueJobId_key" ON "RenderJob"("queueJobId");

-- CreateIndex
CREATE INDEX "RenderJob_userId_status_idx" ON "RenderJob"("userId", "status");

-- CreateIndex
CREATE INDEX "RenderJob_weddingProjectId_status_idx" ON "RenderJob"("weddingProjectId", "status");

-- CreateIndex
CREATE INDEX "RenderJob_videoProjectId_status_idx" ON "RenderJob"("videoProjectId", "status");

-- CreateIndex
CREATE INDEX "RenderJob_createdAt_idx" ON "RenderJob"("createdAt");

-- CreateIndex
CREATE INDEX "RenderJob_deletedAt_idx" ON "RenderJob"("deletedAt");

-- CreateIndex
CREATE INDEX "RSVP_invitationProjectId_attendance_idx" ON "RSVP"("invitationProjectId", "attendance");

-- CreateIndex
CREATE INDEX "RSVP_createdAt_idx" ON "RSVP"("createdAt");

-- CreateIndex
CREATE INDEX "RSVP_deletedAt_idx" ON "RSVP"("deletedAt");

-- CreateIndex
CREATE INDEX "Guestbook_invitationProjectId_isHidden_idx" ON "Guestbook"("invitationProjectId", "isHidden");

-- CreateIndex
CREATE INDEX "Guestbook_createdAt_idx" ON "Guestbook"("createdAt");

-- CreateIndex
CREATE INDEX "Guestbook_deletedAt_idx" ON "Guestbook"("deletedAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingProject" ADD CONSTRAINT "WeddingProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_weddingProjectId_fkey" FOREIGN KEY ("weddingProjectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_musicAssetId_fkey" FOREIGN KEY ("musicAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationProject" ADD CONSTRAINT "InvitationProject_weddingProjectId_fkey" FOREIGN KEY ("weddingProjectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationProject" ADD CONSTRAINT "InvitationProject_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationProject" ADD CONSTRAINT "InvitationProject_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_weddingProjectId_fkey" FOREIGN KEY ("weddingProjectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoScene" ADD CONSTRAINT "VideoScene_videoProjectId_fkey" FOREIGN KEY ("videoProjectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoScene" ADD CONSTRAINT "VideoScene_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LyricSegment" ADD CONSTRAINT "LyricSegment_videoProjectId_fkey" FOREIGN KEY ("videoProjectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_weddingProjectId_fkey" FOREIGN KEY ("weddingProjectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_videoProjectId_fkey" FOREIGN KEY ("videoProjectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_outputAssetId_fkey" FOREIGN KEY ("outputAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_invitationProjectId_fkey" FOREIGN KEY ("invitationProjectId") REFERENCES "InvitationProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guestbook" ADD CONSTRAINT "Guestbook_invitationProjectId_fkey" FOREIGN KEY ("invitationProjectId") REFERENCES "InvitationProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
