import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const premiumUsers = new Map<string, { isPremium: boolean; purchasedAt: string | null }>();

export const premiumRouter = createTRPCRouter({
  getStatus: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      console.log("[premium.getStatus] Checking premium for user:", input.userId);
      const record = premiumUsers.get(input.userId);
      return {
        isPremium: record?.isPremium ?? false,
        purchasedAt: record?.purchasedAt ?? null,
      };
    }),

  markPremium: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ input }) => {
      console.log("[premium.markPremium] Marking user as premium:", input.userId);
      const now = new Date().toISOString();
      premiumUsers.set(input.userId, { isPremium: true, purchasedAt: now });
      return { success: true, isPremium: true, purchasedAt: now };
    }),

  revoke: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ input }) => {
      console.log("[premium.revoke] Revoking premium for user:", input.userId);
      premiumUsers.set(input.userId, { isPremium: false, purchasedAt: null });
      return { success: true, isPremium: false };
    }),
});
