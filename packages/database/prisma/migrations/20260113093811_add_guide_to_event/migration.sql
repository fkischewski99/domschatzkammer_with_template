-- AlterTable
ALTER TABLE "Event" ADD COLUMN "guideId" UUID;

-- CreateIndex
CREATE INDEX "IX_Event_guideId" ON "Event"("guideId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
