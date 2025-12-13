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

  /**
   * Authenticate user and get JWT token
   * @returns JWT token for backend verification
   */
  const authenticate = useCallback(async (): Promise<string> => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      const { token } = await sdk.quickAuth.getToken();

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
  }, []);

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
