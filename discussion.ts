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

router.post("/:id/comments", async (req, res) => {
  try {
    const { user_id, author, content, anonymous, verified } = req.body;
    const threadId = parseInt(req.params.id); // Ambil ID thread dari parameter URL

    // Pastikan data yang diperlukan tidak kosong
    if (!user_id || !author || !content || !threadId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Cek apakah thread dengan ID yang diberikan ada
    const existingThread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!existingThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Buat komentar baru
    const newComment = await prisma.comment.create({
      data: {
        user_id,
        author,
        content,
        anonymous,
        verified,
        thread_id: threadId, // Set ID thread untuk komentar
      },
    });

    res.json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint untuk membuat komentar berdasarkan comment_id
router.post("/:comment_id/reply", async (req: Request, res: Response) => {
  try {
    const { user_id, author, content, anonymous } = req.body;
    const commentId = parseInt(req.params.comment_id);

    // Pastikan data yang diperlukan tidak kosong
    if (!user_id || !author || !content || !commentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Cek apakah komentar dengan ID yang diberikan ada
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Buat comment reply baru
    const newCommentReply = await prisma.comment_reply.create({
      data: {
        comment_id: commentId,
        user_id,
        author,
        content,
        anonymous,
      },
    });

    res.status(201).json(newCommentReply);
  } catch (error) {
    console.error("Error creating comment reply:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint untuk mendapatkan semua balasan komentar berdasarkan comment_id
router.get("/:comment_id/replies", async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.comment_id);

    // Cek apakah comment_id valid
    if (!commentId || isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    // Cari semua comment replies berdasarkan comment_id
    const commentReplies = await prisma.comment_reply.findMany({
      where: {
        comment_id: commentId,
      },
    });

    res.status(200).json(commentReplies);
  } catch (error) {
    console.error("Error fetching comment replies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;
