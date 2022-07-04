import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createUserSchema, loginUserSchema } from './schema/user.schema';
import {
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerHandler,
} from './controllers/auth.controller';
import { getMeHandler } from './controllers/user.controller';
import { deserializeUser } from './middleware/deserializeUser';
import connectDB from './utils/connectDB';
import customConfig from './config/default';
import {
  createPostSchema,
  filterQuery,
  params,
  updatePostSchema,
} from './schema/post.schema';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  updatePostHandler,
} from './controllers/post.controller';

dotenv.config({ path: path.join(__dirname, './.env') });

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) =>
  deserializeUser({ req, res });

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

function createRouter() {
  return trpc.router<Context>();
}

const authRouter = createRouter()
  .mutation('register', {
    input: createUserSchema,
    resolve: ({ input }) => registerHandler({ input }),
  })
  .mutation('login', {
    input: loginUserSchema,
    resolve: async ({ input, ctx }) => await loginHandler({ input, ctx }),
  })
  .mutation('logout', {
    resolve: ({ ctx }) => logoutHandler({ ctx }),
  })
  .query('refresh', {
    resolve: ({ ctx }) => refreshAccessTokenHandler({ ctx }),
  });

const userRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new trpc.TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }
    return next();
  })
  .query('me', {
    resolve: ({ ctx }) => getMeHandler({ ctx }),
  });

const postRouter = createRouter()
  .mutation('create', {
    input: createPostSchema,
    resolve: ({ input, ctx }) => createPostHandler({ input, ctx }),
  })
  .mutation('update', {
    input: updatePostSchema,
    resolve: ({ input }) =>
      updatePostHandler({ paramsInput: input.params, input: input.body }),
  })
  .mutation('delete', {
    input: params,
    resolve: ({ input }) => deletePostHandler({ paramsInput: input }),
  })
  .query('getPost', {
    input: params,
    resolve: ({ input }) => getPostHandler({ paramsInput: input }),
  })
  .query('getPosts', {
    input: filterQuery,
    resolve: ({ input }) => getPostsHandler({ filterQuery: input }),
  });

const appRouter = createRouter()
  .query('hello', {
    resolve() {
      return { name: 'Hello World' };
    },
  })
  .merge('auth.', authRouter)
  .merge('users.', userRouter)
  .merge('posts.', postRouter);

export type AppRouter = typeof appRouter;

const app = express();
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use(cookieParser());
app.use(
  cors({
    origin: [customConfig.origin],
    credentials: true,
  })
);
app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const port = customConfig.port;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);

  // CONNECT DB
  connectDB();
});
