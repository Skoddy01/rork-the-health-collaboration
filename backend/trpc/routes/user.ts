import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

interface UserData {
  userId: string;
  email: string;
  name: string;
  quizAnswers: { questionId: number; answer: string }[];
  createdAt: string;
}

const users = new Map<string, UserData>();

export const userRouter = createTRPCRouter({
  sync: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string(),
        name: z.string(),
        quizAnswers: z.array(
          z.object({ questionId: z.number(), answer: z.string() })
        ).optional(),
      })
    )
    .mutation(({ input }) => {
      console.log("[user.sync] Syncing user data:", input.userId);
      const existing = users.get(input.userId);
      const userData: UserData = {
        userId: input.userId,
        email: input.email,
        name: input.name,
        quizAnswers: input.quizAnswers ?? existing?.quizAnswers ?? [],
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      users.set(input.userId, userData);
      return { success: true, user: userData };
    }),

  get: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      console.log("[user.get] Getting user data:", input.userId);
      const userData = users.get(input.userId);
      return userData ?? null;
    }),
});
