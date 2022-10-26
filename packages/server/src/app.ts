import path from "path";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import connectDB from "./utils/connectDB";
import redisClient from "./utils/connectRedis";
import customConfig from "./config/default";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";

dotenv.config({ path: path.join(__dirname, "./.env") });

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const appRouter = t.router({
  sayHello: t.procedure.query(async () => {
    const message = await redisClient.get("tRPC");
    return { message };
  }),
});

export type AppRouter = typeof appRouter;

const app = express();
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(
  cors({
    origin: [customConfig.origin, "http://localhost:3000"],
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
