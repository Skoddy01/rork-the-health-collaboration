import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    console.warn('[trpc] EXPO_PUBLIC_RORK_API_BASE_URL is not set, tRPC calls will be disabled');
    return null;
  }
  return url;
};

const baseUrl = getBaseUrl();

export const isTrpcAvailable = !!baseUrl;

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: baseUrl ? `${baseUrl}/api/trpc` : 'http://localhost:0/api/trpc',
      transformer: superjson,
    }),
  ],
});
