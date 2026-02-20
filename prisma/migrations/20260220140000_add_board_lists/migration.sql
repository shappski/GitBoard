-- CreateTable
CREATE TABLE "BoardList" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "gitlabBoardId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "BoardList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardList_projectId_idx" ON "BoardList"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardList_projectId_label_key" ON "BoardList"("projectId", "label");

-- AddForeignKey
ALTER TABLE "BoardList" ADD CONSTRAINT "BoardList_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MonitoredProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
