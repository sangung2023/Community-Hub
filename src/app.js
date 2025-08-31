import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js';
import PostsRouter from './routes/posts.router.js';
import CommentsRouter from './routes/comments.router.js';
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import expressSession from 'express-session';
import expressMySQLSession from 'express-mysql-session';

const app = express();
const PORT = 3018;

const MySQLStore = expressMySQLSession(expressSession);
const sessionStore = new MySQLStore({
	user: 'root',
	password: 'aaaa4321',
	host: 'express-db.ch2imuc2cnne.ap-northeast-2.rds.amazonaws.com',
	port: 3306,
	database: 'community_hub',
	expiration: 1000 * 60 * 60 * 24,
	createDatabaseTable: true,
});

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(
	expressSession({
		secret: 'custom-secret-key',
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24,
		},
		store: sessionStore,
	})
);

app.use('/api', [UsersRouter, PostsRouter, CommentsRouter]);
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
	console.log(PORT, '포트로 서버가 열렸어요!');
});
