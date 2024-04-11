/*
  Warnings:

  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Report";

-- CreateTable
CREATE TABLE "report" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "report_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_review" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);
