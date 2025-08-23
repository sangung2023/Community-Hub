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

	return res.status(201).json({ data: post });
});

/* 게시글 목록 조회 API */
router.get('/posts', async (req, res, next) => {
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
router.get('/posts/:postId', async (req, res, next) => {
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

	return res.status(200).json({ data: post });
});

/* 게시글 수정 API */
router.put('/posts/:postId', authMiddleware, async (req, res, next) => {
	try {
		const { userId } = req.user;
		const { postId } = req.params;
		const { title, content } = req.body;

		const post = await prisma.posts.findFirst({
			where: { postId: +postId },
		});

		if (!post)
			return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

		if (post.userId !== userId)
			return res.status(403).json({ message: '게시글 수정 권한이 없습니다.' });

		const updatePost = await prisma.posts.update({
			where: { postId: +postId },
			data: { title, content },
		});

		return res.status(200).json({ data: updatePost });
	} catch (err) {
		next(err);
	}
});

/* 게시글 삭제 API */
router.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
	try {
		const { userId } = req.user;
		const { postId } = req.params;

		const post = await prisma.posts.findFirst({
			where: { postId: +postId },
		});

		if (!post)
			return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

		if (post.userId !== userId)
			return res.status(403).json({ message: '게시글 삭제 권한이 업습니다.' });

		await prisma.posts.delete({
			where: { postId: +postId },
		});

		return res.status(200).json({ message: '게시글이 삭제되었습니다.' });
	} catch (err) {
		next(err);
	}
});

export default router;
