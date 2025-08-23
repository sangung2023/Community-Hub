import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/* 댓글 생성 API */
router.post(
	'/posts/:postId/comments',
	authMiddleware,
	async (req, res, next) => {
		try {
			const { postId } = req.params;
			const { content } = req.body;
			const { userId } = req.user;

			const post = await prisma.posts.findFirst({ where: { postId: +postId } });

			if (!post)
				return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

			const comment = await prisma.comments.create({
				data: {
					postId: +postId,
					userId: +userId,
					content,
				},
			});

			return res.status(201).json({ data: comment });
		} catch (err) {
			next(err);
		}
	}
);

/* 댓글 조회 API */
router.get('/posts/:postId/comments', async (req, res, next) => {
	const { postId } = req.params;

	const comments = await prisma.comments.findMany({
		where: { postId: +postId },
		orderBy: { createdAt: 'desc' },
	});

	return res.status(200).json({ date: comments });
});

/* 댓글 수정 API */
router.put(
	'/posts/:postId/comments/:commentId',
	authMiddleware,
	async (req, res, next) => {
		try {
			const { postId, commentId } = req.params;
			const { content } = req.body;
			const { userId } = req.user;

			const post = await prisma.posts.findFirst({ where: { postId: +postId } });

			if (!post)
				return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

			const comment = await prisma.comments.findFirst({
				where: { commentId: +commentId },
			});

			if (!comment)
				return res.status(404).json({ message: '댓글이 존재하지 않습니다' });

			if (comment.userId !== userId)
				return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });

			const updateComment = await prisma.comments.update({
				where: { commentId: +commentId },
				data: { content },
			});

			return res.status(200).json({ data: updateComment });
		} catch (err) {
			next(err);
		}
	}
);

/* 댓글 삭제 API */
router.delete(
	'/posts/:postId/comments/:commentId',
	authMiddleware,
	async (req, res, next) => {
		try {
			const { postId, commentId } = req.params;
			const { userId } = req.user;

			const post = await prisma.posts.findFirst({ where: { postId: +postId } });

			if (!post)
				return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

			const comment = await prisma.comments.findFirst({
				where: { commentId: +commentId },
			});

			if (!comment)
				return res.status(404).json({ message: '댓글이 존재하지 않습니다' });

			if (comment.userId !== userId)
				return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });

			await prisma.comments.delete({
				where: { commentId: +commentId },
			});

			return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
		} catch (err) {
			next(err);
		}
	}
);

export default router;
