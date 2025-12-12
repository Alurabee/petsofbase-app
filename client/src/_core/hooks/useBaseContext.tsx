import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export interface BaseContext {
  isInMiniApp: boolean;
  user: FarcasterUser | null;
  isLoading: boolean;
}

/**
 * Hook to access Base miniapp Context API
 * Provides Farcaster user profile data when app is opened as a miniapp
 */
export function useBaseContext(): BaseContext {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContext = async () => {
      try {
        // Check if app is opened as a miniapp
        const inApp = await sdk.isInMiniApp();
        setIsInMiniApp(inApp);

        // If in miniapp, get user data from context
        if (inApp) {
          const context = await sdk.context;
          if (context?.user) {
            setUser({
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load Base context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, []);

  return { isInMiniApp, user, isLoading };
}
