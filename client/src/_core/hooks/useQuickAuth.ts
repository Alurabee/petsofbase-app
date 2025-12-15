import { sdk } from "@farcaster/miniapp-sdk";
import { useState, useCallback } from "react";

export interface QuickAuthState {
  token: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
}

/**
 * Hook for Quick Auth authentication in Base Mini Apps
 * 
 * Usage:
 * ```tsx
 * const { token, authenticate, isAuthenticated } = useQuickAuth();
 * 
 * // Call authenticate() before sensitive operations
 * const handleUpload = async () => {
 *   const authToken = await authenticate();
 *   // Use authToken in API calls
 * };
 * ```
 */
export function useQuickAuth() {
  const [state, setState] = useState<QuickAuthState>({
    token: null,
    isAuthenticated: false,
    isAuthenticating: false,
    error: null,
  });

  const getCachedToken = useCallback((): string | null => {
    // Prefer in-memory token (works even when localStorage is blocked).
    try {
      const mem = (globalThis as any).__quickAuthToken as string | undefined;
      if (typeof mem === "string" && mem.length > 0) return mem;
    } catch {
      // ignore
    }

    // Fall back to localStorage if available.
    try {
      const stored = globalThis.localStorage?.getItem("quickAuthToken");
      if (typeof stored === "string" && stored.length > 0) return stored;
    } catch {
      // ignore
    }

    return null;
  }, []);

  /**
   * Authenticate user and get JWT token
   * @returns JWT token for backend verification
   */
  const authenticate = useCallback(async (): Promise<string> => {
    // If we already have a token, reuse it without prompting again.
    const cached = getCachedToken();
    if (cached) {
      setState(prev => ({
        ...prev,
        token: cached,
        isAuthenticated: true,
        isAuthenticating: false,
        error: null,
      }));
      return cached;
    }

    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      const { token } = await sdk.quickAuth.getToken();

      // Keep an in-memory copy for environments where localStorage is blocked.
      try {
        (globalThis as any).__quickAuthToken = token;
      } catch {
        // ignore
      }

      // Persist token so API clients (tRPC/fetch) can reuse it.
      try {
        globalThis.localStorage?.setItem("quickAuthToken", token);
      } catch {
        // ignore
      }
      
      setState({
        token,
        isAuthenticated: true,
        isAuthenticating: false,
        error: null,
      });

      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      setState({
        token: null,
        isAuthenticated: false,
        isAuthenticating: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }, [getCachedToken]);

  /**
   * Clear authentication state
   */
  const clearAuth = useCallback(() => {
    try {
      globalThis.localStorage?.removeItem("quickAuthToken");
    } catch {
      // ignore
    }
    setState({
      token: null,
      isAuthenticated: false,
      isAuthenticating: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    authenticate,
    clearAuth,
  };
}
