/*
  Warnings:

  - A unique constraint covering the columns `[twitterUsername]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "RequestLog" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_twitterUsername_key" ON "Question"("twitterUsername");
