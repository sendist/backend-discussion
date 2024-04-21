/*
  Warnings:

  - You are about to drop the column `upvote` on the `comment_reply` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `comment_reply` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the `list_diskusi` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nama_tag` to the `tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment_reply" DROP COLUMN "upvote",
DROP COLUMN "verified";

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "name",
ADD COLUMN     "nama_tag" TEXT NOT NULL;

-- DropTable
DROP TABLE "list_diskusi";
