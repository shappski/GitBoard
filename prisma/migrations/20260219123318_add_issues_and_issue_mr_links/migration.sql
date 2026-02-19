-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "gitlabId" INTEGER,
    "gitlabUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "MonitoredProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gitlabProjectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameWithNamespace" TEXT,
    "webUrl" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoredProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MergeRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "gitlabMrIid" INTEGER NOT NULL,
    "gitlabMrId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "webUrl" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "authorName" TEXT,
    "authorUsername" TEXT,
    "authorAvatarUrl" TEXT,
    "draft" BOOLEAN NOT NULL DEFAULT false,
    "sourceBranch" TEXT,
    "targetBranch" TEXT,
    "gitlabCreatedAt" TIMESTAMP(3) NOT NULL,
    "gitlabUpdatedAt" TIMESTAMP(3) NOT NULL,
    "pipelineStatus" TEXT,
    "labels" JSONB NOT NULL DEFAULT '[]',
    "reviewers" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MergeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "mrsFetched" INTEGER NOT NULL DEFAULT 0,
    "issuesFetched" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "gitlabIssueIid" INTEGER NOT NULL,
    "gitlabIssueId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "webUrl" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "authorName" TEXT,
    "authorUsername" TEXT,
    "authorAvatarUrl" TEXT,
    "labels" JSONB NOT NULL DEFAULT '[]',
    "gitlabCreatedAt" TIMESTAMP(3) NOT NULL,
    "gitlabUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueMergeRequest" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "mergeRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueMergeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_gitlabId_key" ON "User"("gitlabId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "MonitoredProject_userId_idx" ON "MonitoredProject"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MonitoredProject_userId_gitlabProjectId_key" ON "MonitoredProject"("userId", "gitlabProjectId");

-- CreateIndex
CREATE INDEX "MergeRequest_gitlabUpdatedAt_idx" ON "MergeRequest"("gitlabUpdatedAt");

-- CreateIndex
CREATE INDEX "MergeRequest_state_idx" ON "MergeRequest"("state");

-- CreateIndex
CREATE UNIQUE INDEX "MergeRequest_projectId_gitlabMrIid_key" ON "MergeRequest"("projectId", "gitlabMrIid");

-- CreateIndex
CREATE INDEX "Issue_gitlabUpdatedAt_idx" ON "Issue"("gitlabUpdatedAt");

-- CreateIndex
CREATE INDEX "Issue_state_idx" ON "Issue"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_projectId_gitlabIssueIid_key" ON "Issue"("projectId", "gitlabIssueIid");

-- CreateIndex
CREATE INDEX "IssueMergeRequest_issueId_idx" ON "IssueMergeRequest"("issueId");

-- CreateIndex
CREATE INDEX "IssueMergeRequest_mergeRequestId_idx" ON "IssueMergeRequest"("mergeRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "IssueMergeRequest_issueId_mergeRequestId_key" ON "IssueMergeRequest"("issueId", "mergeRequestId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoredProject" ADD CONSTRAINT "MonitoredProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeRequest" ADD CONSTRAINT "MergeRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MonitoredProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MonitoredProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueMergeRequest" ADD CONSTRAINT "IssueMergeRequest_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueMergeRequest" ADD CONSTRAINT "IssueMergeRequest_mergeRequestId_fkey" FOREIGN KEY ("mergeRequestId") REFERENCES "MergeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
