import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { ResponseType } from "expo-auth-session";
import { AuthErrorInfo, authService } from "@/services/auth.service";

// Complete any pending web authentication sessions
WebBrowser.maybeCompleteAuthSession();

export interface UseGoogleAuthOptions {
  mode?: "login" | "link";
  onSuccess?: () => void;
  onError?: (errorMessage: string, errorDetails?: AuthErrorInfo) => void;
}

/**
 * Custom hook managing Google OAuth flow for Web and Android.
 * Supports:
 * - mode === "login": Exchanges Google ID token with Lunari backend for a session token.
 * - mode === "link": Links Google identity to an existing authenticated user account.
 *
 * Configured via:
 * - process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB
 * - process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID
 */
export function useGoogleAuth(options?: UseGoogleAuthOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

  const trimmedWebClientId = webClientId?.trim();
  const trimmedAndroidClientId = androidClientId?.trim();

  // Determine configuration availability per platform
  const isWebConfigured = Boolean(trimmedWebClientId);
  const isAndroidConfigured = Boolean(trimmedAndroidClientId);
  const isPlatformConfigured = Platform.select({
    android: isAndroidConfigured || isWebConfigured,
    default: isWebConfigured,
  });

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Pass fallback string ("") so expo-auth-session does not throw invariantClientId
  // during component render and crash the entire Expo Router layout when client IDs
  // have not yet been placed into the local .env file.
  //
  // On Web, Google.useAuthRequest automatically generates redirectUri as window.location.origin
  // (e.g. http://localhost:8081 without trailing slash).
  // On Android, it uses the native package redirect (com.balaji_ro.periodtracker:/oauthredirect).
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: trimmedWebClientId || "",
    androidClientId: trimmedAndroidClientId || "",
    responseType: ResponseType.IdToken,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (__DEV__ && request?.redirectUri) {
      console.log(`[GoogleAuth] Initialized with redirect_uri: "${request.redirectUri}"`);
    }
  }, [request?.redirectUri]);

  useEffect(() => {
    async function handleResponse() {
      if (!response) return;

      if (response.type === "success") {
        const { id_token, idToken } = (response.params as any) || {};
        const token = id_token || idToken;

        if (!token) {
          const msg = "Google sign-in succeeded, but no ID token was received.";
          setError(msg);
          optionsRef.current?.onError?.(msg, {
            title: "Sign In Error",
            message: msg,
          });
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        try {
          if (optionsRef.current?.mode === "link") {
            await authService.linkGoogle(token);
          } else {
            await authService.googleLogin(token);
          }
          optionsRef.current?.onSuccess?.();
        } catch (err) {
          const fallback =
            optionsRef.current?.mode === "link"
              ? "Failed to link Google account. Please try again."
              : "Google sign-in failed. Please try again.";
          const details = authService.getAuthErrorDetails(err, fallback);
          setError(details.message);
          optionsRef.current?.onError?.(details.message, details);
        } finally {
          setIsLoading(false);
        }
      } else if (response.type === "cancel") {
        setIsLoading(false);
      } else if (response.type === "error") {
        setIsLoading(false);
        const msg =
          response.error?.message ||
          "Google sign-in was cancelled or encountered an error.";
        setError(msg);
        optionsRef.current?.onError?.(msg, {
          title: "Sign In Notice",
          message: msg,
        });
      }
    }

    handleResponse();
  }, [response]);

  const signInWithGoogle = async () => {
    setError(null);

    // Provide actionable error when client ID is missing for the current platform
    if (!isPlatformConfigured) {
      const missingVar =
        Platform.OS === "android" && !isAndroidConfigured && !isWebConfigured
          ? "EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID (or EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB)"
          : "EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB";
      const msg = `Google Sign-In is not configured. Please set ${missingVar} in frontend/.env.`;
      setError(msg);
      optionsRef.current?.onError?.(msg, {
        title: "Configuration Notice",
        message: msg,
      });
      return;
    }

    if (!request) {
      const msg = "Google Sign-In is not ready. Please try again in a moment.";
      setError(msg);
      optionsRef.current?.onError?.(msg, {
        title: "Sign In Notice",
        message: msg,
      });
      return;
    }

    if (__DEV__) {
      console.log(
        `[GoogleAuth] Starting Google OAuth flow. Platform: ${Platform.OS}, redirect_uri: "${request.redirectUri}"`
      );
    }

    try {
      setIsLoading(true);
      await promptAsync();
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || "Failed to start Google sign-in.";
      setError(msg);
      optionsRef.current?.onError?.(msg, {
        title: "Sign In Notice",
        message: msg,
      });
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    isReady: Boolean(isPlatformConfigured && request),
    isConfigured: Boolean(isPlatformConfigured),
    redirectUri: request?.redirectUri,
  };
}
