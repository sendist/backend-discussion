import express, { Request, Response } from "express";
import { prisma } from "./prisma";

const router = express.Router();

router.get("/discussion/discussion/discussion/tags", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/thread", async (req, res) => {
  try {
    const { user_id, author, title, content, anonymous, tags } = req.body;
    
    if (!user_id || !author || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newThread = await prisma.thread.create({
      data: {
        user_id,
        author,
        title,
        content,
        anonymous,
      },
    });

    if (tags && tags.length > 0) {
      const threadTags = tags.map((tagId: number) => {
        return {
          tag_id: tagId,
          thread_id: newThread.id,
        };
      });
      await prisma.thread_tag.createMany({
        data: threadTags,
      });
    }

    res.json(newThread);
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// definisikan semua subroute disini
router.get("/test", (req, res) => {
  // #swagger.tags = ['Test Route']
  // #swagger.description = 'Ini test route'
  res.send("This is test route");
});

router.get("/", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Get all discussions'
  const discussions = await prisma.thread.findMany({
    include: {
      comment: {
        include: {
          comment_reply: true,
        },
      },
      thread_tag: {
        select: {
          tag: true,
        },
      },
    },
  });
  res.json(discussions);
});

router.get("/:id", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Get a discussion by id'
  const id = parseInt(req.params.id);
  const discussion = await prisma.thread.findUnique({
    where: {
      id: id,
    },
    include: {
      comment: {
        include: {
          comment_reply: true,
        },
      },
      thread_tag: {
        select: {
          tag: true,
        },
      },
    },
  });
  res.json(discussion);
});

router.delete("/:id", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Delete a discussion by id'
  const id = parseInt(req.params.id);
  const userId = req.body.userId;

  const creator = await prisma.thread.findUnique({
    where: { id },
    select: { user_id: true },
  });

  if (!creator) {
    return res.status(404).json({ error: "Discussion not found" });
  }

  if (creator.user_id !== userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await prisma.thread.delete({
      where: { id },
    });
    res.json({ message: "Discussion deleted" });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/comment/:id", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Delete a comment by id'
  const id = parseInt(req.params.id);
  const userId = req.body.userId;

  const creator = await prisma.comment.findUnique({
    where: { id },
    select: { user_id: true },
  });

  if (!creator) {
    return res.status(404).json({ error: "Comment not found" });
  }

  if (creator.user_id !== userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await prisma.comment.delete({
      where: { id },
    });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/comment-reply/:id", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Delete a comment reply by id'
  const id = parseInt(req.params.id);
  const userId = req.body.userId;

  const creator = await prisma.comment_reply.findUnique({
    where: { id },
    select: { user_id: true },
  });

  if (!creator) {
    return res.status(404).json({ error: "Comment reply not found" });
  }

  if (creator.user_id !== userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await prisma.comment_reply.delete({
      where: { id },
    });
    res.json({ message: "Comment reply deleted" });
  } catch (error) {
    console.error("Error deleting comment reply:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
