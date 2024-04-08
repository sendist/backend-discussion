const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post("/api/threads", async (req, res) => {
  const {
    author,
    created_at,
    raw_body,
    anonymous,
    course_id,
    topic_id,
    id,
    type,
    title,
    closed,
  } = req.body;
  console.log(req.body);
  const thread = await prisma.list_diskusi.create({
    data: {
      author,
      created_at,
      raw_body,
      anonymous,
      course_id,
      topic_id,
      id,
      type,
      title,
      closed,
    },
  });
  res.json(thread);
});

app.put("/api/threads/:threadId", async (req, res) => {
  const { threadId } = req.params;
  const updateData = req.body;

  const allowedFields = [
    "author",
    "created_at",
    "raw_body",
    "anonymous",
    "course_id",
    "topic_id",
    "id",
    "type",
    "title",
    "closed",
  ];

  const filteredUpdateData = Object.keys(updateData)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  try {
    const updatedThread = await prisma.list_diskusi.update({
      where: { id: threadId },
      data: filteredUpdateData,
    });

    res.json(updatedThread);
  } catch (error) {
    console.error("Error updating thread:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(404).send("Thread not found");
    } else {
      res.status(500).send("Something went wrong.");
    }
  }
});

app.get("/api/register", async (req, res) => {
  // Process the received thread data - req.body will contain it
  console.log("Received account data:", req.body);

  // You can save the data to a database, log it, send it to another service, etc.

  res.status(201).json({ message: "Thread data received!" });
});

app.get("/api/threads/:threadId?", async (req, res) => {
  const searchQuery = req.query.search;
  const page = parseInt(req.query.page) || 1; // Get 'page' with default of 1
  const limit = parseInt(req.query.limit) || 10; // 'limit' with default of 10

  const skip = (page - 1) * limit;

  let threads;

  try {
    if (searchQuery) {
      threads = await prisma.list_diskusi.findMany({
        skip,
        take: limit,
        where: {
          OR: [{ title: { contains: searchQuery, mode: "insensitive" } }],
        },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          author: true,
          title: true,
          created_at: true,
          raw_body: true,
          anonymous: true,
          closed: true,
          course_id: true,
        },
      });
    }
    else if (req.params.threadId) {
      const threadId = req.params.threadId;

      try {
        const thread = await prisma.list_diskusi.findUnique({
          where: { id: threadId },
          select: {
            author: true,
            title: true,
            created_at: true,
            raw_body: true,
            anonymous: true,
            closed: true,
            course_id: true,
          },
        });

        if (!thread) {
          return res.status(404).json({ error: "Thread not found" });
        }

        return res.json(thread);
      } catch (error) {
        console.error("Error fetching thread:", error);
        return res.status(500).json({ error: "Error fetching thread id" });
      }
    } else {
      threads = await prisma.list_diskusi.findMany({
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          author: true,
          title: true,
          created_at: true,
          raw_body: true,
          anonymous: true,
          closed: true,
          course_id: true,
        },
      });
    }

    res.json(threads);
  } catch (error) {
    console.error("Request error:", error);
    res.status(500).json({ error: "Error fetching threads" });
  }
});
