import express from "express";
import { prisma } from "./prisma";

const router = express.Router();

router.post("/thread", async (req, res) => {
  const { data } = await req.body;
  console.log(req.body);
  console.log(data);
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
  } else

  if (creator.user_id !== userId) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
    await prisma.thread.delete({
      where: { id },
    });
    res.json({ message: "Discussion deleted" });
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
  } else

  if (creator.user_id !== userId) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
    await prisma.comment.delete({
      where: { id },
    });
    res.json({ message: "Comment deleted" });
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
  } else

  if (creator.user_id !== userId) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
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

router.post("/report", async (req, res) => {
  const { data } = await req.body;
  console.log(req.body);
  console.log(data);
});

export default router;
