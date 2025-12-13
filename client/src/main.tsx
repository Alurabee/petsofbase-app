import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { sdk } from "@farcaster/miniapp-sdk";

import "./index.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

// Base Mini Apps use Quick Auth - no redirect needed
// Users are automatically authenticated via Farcaster context

let cachedQuickAuthToken: string | null = null;
async function getQuickAuthToken(): Promise<string | null> {
  if (cachedQuickAuthToken) return cachedQuickAuthToken;
  try {
    const stored = globalThis.localStorage?.getItem("quickAuthToken");
    if (stored) {
      cachedQuickAuthToken = stored;
      return stored;
    }
  } catch {
    // ignore
  }

  try {
    const inApp = await sdk.isInMiniApp();
    if (!inApp) return null;
    const { token } = await sdk.quickAuth.getToken();
    cachedQuickAuthToken = token;
    try {
      globalThis.localStorage?.setItem("quickAuthToken", token);
    } catch {
      // ignore
    }
    return token;
  } catch {
    return null;
  }
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        const token = await getQuickAuthToken();
        const headers = new Headers((init as any)?.headers ?? undefined);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="petsofbase-theme">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
