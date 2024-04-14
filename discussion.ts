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
  // #swagger.description = 'Get all discussions threads'
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
  // #swagger.description = 'Get a specific discussion by id'
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
  // #swagger.description = 'Delete a specific discussion by id'
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
  // #swagger.description = 'Delete a specific comment by id'
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
  // #swagger.description = 'Delete a specific comment reply by id'
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
  }
});

router.patch("/comment/:id/upvote", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Upvote a comment if not upvoted by user, otherwise remove upvote'
  const id = parseInt(req.params.id);
  const userId = req.body.userId;

  try {
    const existingUpvote = await prisma.user_upvote_comment.findUnique({
      where: {
        user_id_comment_id: {
          comment_id: id,
          user_id: userId,
        },
      },
    });

    if (existingUpvote) {
      // Remove upvote
      await prisma.$transaction([
        prisma.comment.update({
          where: { id },
          data: { upvote: { decrement: 1 } },
        }),
        prisma.user_upvote_comment.delete({
          where: { user_id_comment_id: existingUpvote },
        }),
      ]);
      res.json({ message: "Upvote removed", voted: false });
    } else {
      // Add upvote
      await prisma.$transaction([
        prisma.comment.update({
          where: { id },
          data: { upvote: { increment: 1 } },
        }),
        prisma.user_upvote_comment.create({
          data: { comment_id: id, user_id: userId },
        }),
      ]);
      res.json({ message: "Upvote added", voted: true });
    }
  } catch (error) {
    console.error("Error handling upvote:", error);
    res.status(500).json({ error: "Failed to process upvote" });
  }
});

router.post("/comment/user-upvote/:id", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Check if user has upvoted a comment'
  const id = parseInt(req.params.id);
  const userId = req.body.userId;
  const existingUpvote = await prisma.user_upvote_comment.findUnique({
    where: {
      user_id_comment_id: {
        comment_id: id,
        user_id: userId,
      },
    },
  });
  console.log(existingUpvote);
  if (existingUpvote) {
    res.json({ existed: true });
  } else {
    res.json({ existed: false });
  }
});

router.patch("/comment/:id/verify", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Verify a specific comment if not verified, otherwise unverify it'
  const id = parseInt(req.params.id);
  const isAdministrator = req.body.isAdmin;

if (!isAdministrator) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
    const existingComment = await prisma.comment.findUnique({ 
      where: { id }
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { verified: !existingComment.verified },
    }); 
    res.json(comment);
  }
});

export default router;
