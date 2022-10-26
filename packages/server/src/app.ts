import path from "path";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createUserSchema, loginUserSchema } from "./schema/user.schema";
import {
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerHandler,
} from "./controllers/auth.controller";
import { getMeHandler } from "./controllers/user.controller";
import { deserializeUser } from "./middleware/deserializeUser";
import connectDB from "./utils/connectDB";
import customConfig from "./config/default";
import {
  createPostSchema,
  filterQuery,
  params,
  updatePostSchema,
} from "./schema/post.schema";
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  updatePostHandler,
} from "./controllers/post.controller";

dotenv.config({ path: path.join(__dirname, "./.env") });

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) =>
  deserializeUser({ req, res });

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

const authRouter = t.router({
  registerUser: t.procedure
    .input(createUserSchema)
    .mutation(({ input }) => registerHandler({ input })),
  loginUser: t.procedure
    .input(loginUserSchema)
    .mutation(({ input, ctx }) => loginHandler({ input, ctx })),
  logoutUser: t.procedure.mutation(({ ctx }) => logoutHandler({ ctx })),
  refreshToken: t.procedure.query(({ ctx }) =>
    refreshAccessTokenHandler({ ctx })
  ),
});

const isAuthorized = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next();
});

const isAuthorizedProcedure = t.procedure.use(isAuthorized);

const userRouter = t.router({
  sayHello: t.procedure.query(async () => {
    const message = "Welcome to tRPC with React and Node.js";
    return { message };
  }),
  getMe: isAuthorizedProcedure.query(({ ctx }) => getMeHandler({ ctx })),
});

const postRouter = t.router({
  createPost: t.procedure
    .input(createPostSchema)
    .mutation(({ input, ctx }) => createPostHandler({ input, ctx })),
  updatePost: t.procedure
    .input(updatePostSchema)
    .mutation(({ input }) =>
      updatePostHandler({ paramsInput: input.params, input: input.body })
    ),
  deletePost: t.procedure
    .input(params)
    .mutation(({ input }) => deletePostHandler({ paramsInput: input })),
  getPost: t.procedure
    .input(params)
    .query(({ input }) => getPostHandler({ paramsInput: input })),
  getPosts: t.procedure
    .input(filterQuery)
    .query(({ input }) => getPostsHandler({ filterQuery: input })),
});

const appRouter = t.mergeRouters(authRouter, userRouter, postRouter);
export type AppRouter = typeof appRouter;

const app = express();
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(cookieParser());
app.use(
  cors({
    origin: [customConfig.origin],
    credentials: true,
  })
);
app.use(
  "/api/trpc",
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
