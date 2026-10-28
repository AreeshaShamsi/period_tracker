import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from "firebase/auth";
import { AuthErrorInfo, authService } from "@/services/auth.service";
import {
  getFirebaseAuth,
  isFirebaseClientConfigured,
  webClientId,
} from "@/config/firebase";

export interface UseGoogleAuthOptions {
  mode?: "login" | "link";
  onSuccess?: () => void;
  onError?: (errorMessage: string, errorDetails?: AuthErrorInfo) => void;
}

/**
 * Safely retrieve @react-native-google-signin/google-signin native module if available.
 * Prevents TurboModuleRegistry crashes in Expo Web and standard Expo Go environments.
 */
function getNativeGoogleSignin(): {
  GoogleSignin: any | null;
  statusCodes: Record<string, string>;
} {
  if (Platform.OS === "web") {
    return { GoogleSignin: null, statusCodes: {} };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@react-native-google-signin/google-signin");
    return {
      GoogleSignin: mod.GoogleSignin || null,
      statusCodes: mod.statusCodes || {},
    };
  } catch {
    // In standard Expo Go or environments without the native module compiled in
    return { GoogleSignin: null, statusCodes: {} };
  }
}

/**
 * Custom hook managing Firebase Google Authentication across Android, iOS, and Web.
 *
 * Flow:
 * 1. User taps "Continue with Google"
 * 2. Android (Dev/Prod Build): Authenticates natively via @react-native-google-signin/google-signin
 *    Web: Authenticates via Firebase signInWithPopup
 *    Expo Go: Displays clear instruction that an Expo development build is required
 * 3. Exchanges Google credentials with Firebase Authentication for a verified Firebase ID token
 * 4. Sends verified Firebase ID token to Lunari backend (/api/auth/google or /api/auth/link-google)
 * 5. Lunari backend verifies Firebase ID token via Firebase Admin SDK and issues application JWT
 * 6. Application session token is stored securely; navigation proceeds based on onboarding status
 */
export function useGoogleAuth(options?: UseGoogleAuthOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Configure native Google Sign-In for Android / iOS when running in a development build
  useEffect(() => {
    if (Platform.OS !== "web") {
      try {
        const { GoogleSignin } = getNativeGoogleSignin();
        if (GoogleSignin && typeof GoogleSignin.configure === "function") {
          GoogleSignin.configure({
            webClientId: webClientId.trim() || undefined,
            scopes: ["email", "profile"],
            offlineAccess: false,
          });
        }
      } catch (err) {
        if (__DEV__) {
          console.warn("[GoogleAuth] Failed to configure native GoogleSignin:", err);
        }
      }
    }
  }, []);

  const isConfigured = isFirebaseClientConfigured();

  const signInWithGoogle = async () => {
    if (isLoading) return; // Prevent duplicate submissions

    setError(null);

    // 1. Check if Firebase configuration is provided
    if (!isConfigured) {
      const msg =
        "Google Sign-In is not configured. Please add EXPO_PUBLIC_FIREBASE_API_KEY and EXPO_PUBLIC_FIREBASE_PROJECT_ID in frontend/.env.";
      setError(msg);
      optionsRef.current?.onError?.(msg, {
        title: "Configuration Notice",
        message: msg,
        code: "FIREBASE_NOT_CONFIGURED",
      });
      return;
    }

    setIsLoading(true);

    try {
      let firebaseIdToken: string | null = null;
      const auth = getFirebaseAuth();

      if (Platform.OS === "web") {
        // Web flow: Firebase popup
        const provider = new GoogleAuthProvider();
        provider.addScope("email");
        provider.addScope("profile");
        const userCredential = await signInWithPopup(auth, provider);
        firebaseIdToken = await userCredential.user.getIdToken();
      } else {
        // Native Android / iOS flow
        const { GoogleSignin, statusCodes } = getNativeGoogleSignin();

        if (!GoogleSignin) {
          const msg =
            "Native Google Sign-In requires an Expo development build or standalone build. Please run the app using 'npx expo run:android'.";
          setError(msg);
          optionsRef.current?.onError?.(msg, {
            title: "Development Build Required",
            message: msg,
            code: "DEV_BUILD_REQUIRED",
          });
          setIsLoading(false);
          return;
        }

        try {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });
        } catch (playErr: any) {
          if (
            playErr?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE ||
            /play services/i.test(playErr?.message || "")
          ) {
            const msg =
              "Google Play Services is not available or outdated on this device. Please update Google Play Services.";
            setError(msg);
            optionsRef.current?.onError?.(msg, {
              title: "Play Services Notice",
              message: msg,
              code: "PLAY_SERVICES_NOT_AVAILABLE",
            });
            setIsLoading(false);
            return;
          }
          throw playErr;
        }

        const response = await GoogleSignin.signIn();

        // Check for cancellation in @react-native-google-signin (response.type === 'cancelled')
        if ((response as any)?.type === "cancelled") {
          setIsLoading(false);
          return;
        }

        // Extract Google ID token
        const googleIdToken =
          (response as any)?.data?.idToken ||
          (response as any)?.idToken ||
          (response as any)?.data?.user?.idToken;

        if (!googleIdToken) {
          throw new Error("Google sign-in succeeded, but no ID token was received from Google.");
        }

        // Authenticate with Firebase using Google credential
        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCredential = await signInWithCredential(auth, credential);
        firebaseIdToken = await userCredential.user.getIdToken();
      }

      if (!firebaseIdToken) {
        throw new Error("Failed to acquire verified Firebase ID token.");
      }

      // 4. Send Firebase ID token to Lunari backend
      if (optionsRef.current?.mode === "link") {
        await authService.linkGoogle(firebaseIdToken);
      } else {
        await authService.googleLogin(firebaseIdToken);
      }

      // 5. Notify success
      optionsRef.current?.onSuccess?.();
    } catch (err: any) {
      const { statusCodes } = getNativeGoogleSignin();

      // Cancellation error handling (never show an alert or false error for user cancelling)
      if (
        (statusCodes?.SIGN_IN_CANCELLED && err?.code === statusCodes.SIGN_IN_CANCELLED) ||
        err?.code === "auth/popup-closed-by-user" ||
        err?.message?.includes("cancelled") ||
        err?.message?.includes("canceled")
      ) {
        setIsLoading(false);
        return;
      }

      if (statusCodes?.IN_PROGRESS && err?.code === statusCodes.IN_PROGRESS) {
        setIsLoading(false);
        return;
      }

      // Detect Expo Go limitation
      const isExpoGo =
        err?.message?.includes("RNGoogleSignin") ||
        err?.message?.includes("NativeModule") ||
        err?.message?.includes("development build");

      if (isExpoGo) {
        const msg =
          "Native Google Sign-In requires an Expo development build or standalone build. Please run the app using 'npx expo run:android'.";
        setError(msg);
        optionsRef.current?.onError?.(msg, {
          title: "Development Build Required",
          message: msg,
          code: "DEV_BUILD_REQUIRED",
        });
        setIsLoading(false);
        return;
      }

      // Map backend or network error
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
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    isReady: true,
    isConfigured,
  };
}
