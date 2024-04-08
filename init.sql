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
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tag" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "thread_tag" (
    "thread_id" INTEGER REFERENCES "thread"("id") ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES "tag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("thread_id", "tag_id")
);