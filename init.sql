CREATE TABLE IF NOT EXISTS "thread" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT FALSE,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "comment" (
    "id" SERIAL PRIMARY KEY,
    "thread_id" INTEGER REFERENCES "thread"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT FALSE,
    "verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "upvote" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "comment_reply" (
    "id" SERIAL PRIMARY KEY,
    "comment_id" INTEGER REFERENCES "comment"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tag" (
    "id" SERIAL PRIMARY KEY,
    "nama_tag" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "thread_tag" (
    "thread_id" INTEGER REFERENCES "thread"("id") ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES "tag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("thread_id", "tag_id")
);

CREATE TABLE IF NOT EXISTS "user_upvote_comment" (
    "user_id" TEXT NOT NULL,
    "comment_id" INTEGER REFERENCES "comment"("id") ON DELETE CASCADE,
    PRIMARY KEY ("user_id", "comment_id")
);

CREATE TABLE IF NOT EXISTS "report" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "thread_id" INTEGER REFERENCES "thread"("id") ON DELETE CASCADE,
    "comment_id" INTEGER REFERENCES "comment"("id") ON DELETE CASCADE,
    "comment_reply_id" INTEGER REFERENCES "comment_reply"("id") ON DELETE CASCADE,
    "report_type" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_review" BOOLEAN NOT NULL DEFAULT FALSE
);