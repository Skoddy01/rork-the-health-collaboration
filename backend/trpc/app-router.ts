import { createTRPCRouter } from "./create-context";
import { premiumRouter } from "./routes/premium";
import { userRouter } from "./routes/user";

export const appRouter = createTRPCRouter({
  premium: premiumRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
