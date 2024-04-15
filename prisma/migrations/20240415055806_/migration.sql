-- CreateTable
CREATE TABLE "list_diskusi" (
    "id" VARCHAR NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "raw_body" TEXT,
    "anonymous" BOOLEAN NOT NULL,
    "course_id" VARCHAR(255) NOT NULL,
    "topic_id" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "closed" BOOLEAN NOT NULL,

    CONSTRAINT "list_diskusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "thread_id" INTEGER,
    "user_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upvote" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_tag" (
    "thread_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "thread_tag_pkey" PRIMARY KEY ("thread_id","tag_id")
);

-- CreateTable
CREATE TABLE "comment_reply" (
    "id" SERIAL NOT NULL,
    "comment_id" INTEGER,
    "user_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upvote" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "comment_reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_upvote_comment" (
    "user_id" TEXT NOT NULL,
    "comment_id" INTEGER NOT NULL,

    CONSTRAINT "user_upvote_comment_pkey" PRIMARY KEY ("user_id","comment_id")
);

-- CreateTable
CREATE TABLE "user_upvote_comment_reply" (
    "user_id" TEXT NOT NULL,
    "comment_reply_id" INTEGER NOT NULL,

    CONSTRAINT "user_upvote_comment_reply_pkey" PRIMARY KEY ("user_id","comment_reply_id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "thread_id" INTEGER,
    "comment_id" INTEGER,
    "comment_reply_id" INTEGER,
    "report_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_review" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "thread_tag" ADD CONSTRAINT "thread_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "thread_tag" ADD CONSTRAINT "thread_tag_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment_reply" ADD CONSTRAINT "comment_reply_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_upvote_comment" ADD CONSTRAINT "user_upvote_comment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_upvote_comment_reply" ADD CONSTRAINT "user_upvote_comment_reply_comment_reply_id_fkey" FOREIGN KEY ("comment_reply_id") REFERENCES "comment_reply"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_comment_reply_id_fkey" FOREIGN KEY ("comment_reply_id") REFERENCES "comment_reply"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
