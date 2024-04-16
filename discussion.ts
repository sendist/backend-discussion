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

router.get("/", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Get all discussions threads'
  try {
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
  } catch (error) {
    console.error("Error getting discussions:", error);
    res.status(500).json({ error: "Failed to get discussions" });
  }
});

router.get("/:id", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Get a specific discussion by id'
  try {
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
  } catch (error) {
    console.error("Error getting discussion:", error);
    res.status(500).json({ error: "Failed to get discussion" });
  }
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

    // increment comment count
    await prisma.thread.update({
      where: { id: threadId },
      data: { comment_count: { increment: 1 } },
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
  } catch (error) {
    console.error("Error deleting comment reply:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/comment-reply/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const commentReply = await prisma.comment_reply.findUnique({
      where: {
        id: id,
      },
    });

    if (!commentReply) {
      return res.status(404).json({ error: "Comment reply not found" });
    }

    res.json(commentReply);
  } catch (error) {
    console.error("Error getting comment reply:", error);
    res.status(500).json({ error: "Failed to get comment reply" });
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
  try {
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
    if (existingUpvote) {
      res.json({ existed: true });
    } else {
      res.json({ existed: false });
    }
  } catch (error) {
    console.error("Error checking upvote:", error);
    res.status(500).json({ error: "Failed to check upvote" });
  }
});

router.patch("/comment/:id/verify", async (req, res) => {
  // #swagger.tags = ['Discussion']
  // #swagger.description = 'Verify a specific comment if not verified, otherwise unverify it'

  try {
    const id = parseInt(req.params.id);
    const isAdministrator = req.body.isAdmin;

    if (!isAdministrator) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      const existingComment = await prisma.comment.findUnique({
        where: { id },
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
  } catch (error) {
    console.error("Error verifying comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/comment/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({
      where: {
        id: id,
      },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(comment);
  } catch (error) {
    console.error("Error getting comment:", error);
    res.status(500).json({ error: "Failed to get comment" });
  }
});

router.post("/report", async (req, res) => {
  try {
    const {
      user_id,
      thread_id,
      comment_id,
      comment_reply_id,
      report_type,
      created_at,
      status_review,
    } = req.body;

    const newReport = await prisma.report.create({
      data: {
        user_id,
        thread_id,
        comment_id,
        comment_reply_id,
        report_type,
        created_at,
        status_review,
      },
    });

    res.json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/report/data/:id?", async (req, res) => {
  try {
    const id = req.params.id ? parseInt(req.params.id) : null;
    let report;

    if (id) {
      report = await prisma.report.findUnique({
        where: {
          id: id,
        },
      });
    } else {
      report = await prisma.report.findMany({});
    }

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error getting report:", error);
    res.status(500).json({ error: "Failed to get report" });
  }
});

router.get("/report/list", async (req, res) => {
  try {
    // Mendapatkan semua laporan dari database
    const reports = await prisma.report.findMany({});

    const reportData = [];

    // Iterasi melalui setiap laporan untuk mendapatkan konten dan penulis
    for (const report of reports) {
      let content;
      let author;

      if (report.comment_reply_id) {
        const commentReply = await prisma.comment_reply.findUnique({
          where: {
            id: report.comment_reply_id,
          },
          select: {
            content: true,
            author: true,
          },
        });

        if (commentReply) {
          content = commentReply.content;
          author = commentReply.author;
        }
      } else if (report.comment_id && report.thread_id) {
        const comment = await prisma.comment.findUnique({
          where: {
            id: report.comment_id,
          },
          select: {
            content: true,
            author: true,
          },
        });

        if (comment) {
          content = comment.content;
          author = comment.author;
        }
      } else if (report.thread_id) {
        const thread = await prisma.thread.findUnique({
          where: {
            id: report.thread_id,
          },
          select: {
            title: true,
            author: true,
          },
        });

        if (thread) {
          content = thread.title;
          author = thread.author;
        }
      }

      // Menambahkan data laporan beserta konten dan penulis ke dalam array reportData
      reportData.push({
        ...report,
        content: content,
        author: author,
      });
    }

    // Mengirimkan data laporan yang telah diperoleh
    res.json(reportData);
  } catch (error) {
    console.error("Error getting report content:", error);
    res.status(500).json({ error: "Failed to get report content" });
  }
});

export default router;
