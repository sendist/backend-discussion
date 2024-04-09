import express from "express";
import { prisma } from "./prisma";

const router = express.Router();

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

export default router;
