import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/* 게시글 생성 API */
router.post('/posts', authMiddleware, async (req, res, next) => {
  const { title, content } = req.body;
  const { userId } = req.user;

  const post = await prisma.posts.create({
    data: {
      userId: +userId,
      title,
      content,
    },
  });

  res.status(201).json({ data: post });
});

/* 게시글 목록 조회 API */
router.get('posts', async (req, res, next) => {
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      userId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json({ data: posts });
});

/* 게시글 상세 조회 API */
router.get('posts/:postId', async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
    select: {
      postId: true,
      userId: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({ data: post });
});

export default router;
