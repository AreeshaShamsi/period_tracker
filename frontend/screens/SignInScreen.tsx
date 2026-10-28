import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useOnboarding } from "@/state/OnboardingContext";
import { LockIcon, MailIcon } from "@/components/icons";
import { GoogleIcon } from "@/components/auth";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { loginSchema, getFirstZodError } from "@/schemas/auth.schema";
import { AuthUser, extractOnboardingStatus } from "@/types/auth";
import { logAuthDiagnostic } from "@/utils/devAuthLogger";
import {
  AppText,
  Button,
  DividerWithLabel,
  ErrorModal,
  Screen,
  ScreenHeader,
  TextField,
} from "@/components/ui";

export interface SignInScreenProps {
  onBack?: () => void;
  onSignInSuccess?: (user?: AuthUser) => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
}

export default function SignInScreen({
  onBack,
  onSignInSuccess,
  onSignUp,
  onForgotPassword,
}: SignInScreenProps) {
  const router = useRouter();
  const { onboardingData, setField } = useOnboarding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title?: string;
    message: string;
  }>({
    visible: false,
    message: "",
  });

  const handleErrorDismiss = () => {
    // Closes only the popup without navigating or altering any form fields or auth state
    setErrorModal({ visible: false, message: "" });
  };

  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth({
    onSuccess: async () => {
      try {
        const currentUserRes = await authService.getCurrentUser();
        const user = currentUserRes.data?.user;
        if (user?.name && !onboardingData.name) {
          setField("name", user.name);
        }

        const statusInfo = extractOnboardingStatus(user);

        if (__DEV__) {
          logAuthDiagnostic({
            authMethod: "google",
            hasSessionToken: true,
            meHttpStatus: 200,
            responseStructure: {
              hasProfileObject: statusInfo.hasProfile,
              onboardingCompletedValue: statusInfo.rawStatus,
              sourceProperty: statusInfo.sourceProperty,
            },
            profileState: statusInfo.profileState,
            isLocalCacheOverridingBackend: false,
            navigationGuard: "SignInScreen",
            redirectDecision: statusInfo.isCompleted ? "/(app)/dashboard" : "/onboarding",
            decisionReason: statusInfo.isCompleted
              ? "Existing Google account has onboarding_completed = true"
              : "Google account has incomplete onboarding",
          });
        }

        if (statusInfo.isCompleted) {
          await profileService.syncUserData(user).catch(() => {});
          if (onSignInSuccess) {
            onSignInSuccess(user);
          } else {
            router.replace("/(app)/dashboard" as any);
          }
        } else {
          router.replace("/onboarding" as any);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn("[SignInScreen] Post-Google login user retrieval error:", err);
        }
        if (onSignInSuccess) {
          onSignInSuccess();
        } else {
          router.replace("/(app)/dashboard" as any);
        }
      }
    },
    onError: (msg, details) => {
      const modalTitle = details?.title || "Sign In Notice";
      const modalMessage = details?.message || msg;
      setErrorModal((prev) => {
        if (prev.visible && prev.message === modalMessage) return prev;
        return {
          visible: true,
          title: modalTitle,
          message: modalMessage,
        };
      });
    },
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Back pressed");
    }
  };

  const handleSignIn = async () => {
    if (isLoading || isGoogleLoading) return; // Prevent duplicate submissions

    setError("");

    const validation = loginSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      const valError = getFirstZodError(validation.error);
      setError(valError);
      return;
    }

    const { email: validEmail, password: validPassword } = validation.data;

    setIsLoading(true);
    try {
      const response = await authService.login({
        email: validEmail,
        password: validPassword,
      });

      const user = response.data?.user;
      if (user?.name && !onboardingData.name) {
        setField("name", user.name);
      }

      const statusInfo = extractOnboardingStatus(user);

      if (__DEV__) {
        logAuthDiagnostic({
          authMethod: "email_password",
          hasSessionToken: true,
          meHttpStatus: 200,
          responseStructure: {
            hasProfileObject: statusInfo.hasProfile,
            onboardingCompletedValue: statusInfo.rawStatus,
            sourceProperty: statusInfo.sourceProperty,
          },
          profileState: statusInfo.profileState,
          isLocalCacheOverridingBackend: false,
          navigationGuard: "SignInScreen",
          redirectDecision: statusInfo.isCompleted ? "/(app)/dashboard" : "/onboarding",
          decisionReason: statusInfo.isCompleted
            ? "User profile has onboarding_completed = true"
            : "User profile has onboarding_completed = false (requires onboarding)",
        });
      }

      if (statusInfo.isCompleted) {
        await profileService.syncUserData(user).catch(() => {});
        if (onSignInSuccess) {
          onSignInSuccess(user);
        } else {
          router.replace("/(app)/dashboard" as any);
        }
      } else {
        router.replace("/onboarding" as any);
      }
    } catch (err) {
      const errorDetails = authService.getAuthErrorDetails(
        err,
        "Sign in failed. Please check your credentials and try again."
      );
      setError(errorDetails.message);
      // Prevent duplicate popups from repeated clicks
      setErrorModal((prev) => {
        if (prev.visible && prev.message === errorDetails.message) return prev;
        return {
          visible: true,
          title: errorDetails.title,
          message: errorDetails.message,
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen
      scrollable
      paddingHorizontal
      backgroundColor={colors.white}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* 1. Header with Back Button */}
      <ScreenHeader onBack={handleBack} />

      {/* 2. 16px gap */}
      <View style={{ height: spacing.lg }} />

      {/* 3. Heading */}
      <AppText variant="heading">Welcome Back</AppText>

      {/* 4. 8px gap */}
      <View style={{ height: spacing.sm }} />

      {/* 5. Subtitle */}
      <AppText variant="body">
        Sign in to continue your wellness journey.
      </AppText>

      {/* 6. 28px gap */}
      <View style={{ height: 28 }} />

      {/* 7. Email Field */}
      <TextField
        label="Email"
        placeholder="you@example.com"
        leftIcon={<MailIcon color={colors.inputIcon} size={20} />}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        editable={!isLoading}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError("");
        }}
      />

      {/* 8. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 9. Password Field */}
      <TextField
        label="Password"
        placeholder="Enter your password"
        leftIcon={<LockIcon color={colors.inputIcon} size={20} />}
        secureTextEntry
        value={password}
        editable={!isLoading}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError("");
        }}
        error={error}
      />

      {/* Forgot Password Link */}
      <View style={{ alignItems: "flex-end", marginTop: spacing.xs }}>
        <Pressable
          onPress={onForgotPassword || (() => console.log("Forgot password"))}
          hitSlop={8}
          disabled={isLoading}
        >
          <AppText variant="bodySmall" weight="600" color={colors.primary}>
            Forgot Password?
          </AppText>
        </Pressable>
      </View>

      {/* 10. 24px gap */}
      <View style={{ height: spacing.xl }} />

      {/* 11. CENTERED row: Don't have an account? Sign up */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppText variant="caption" color={colors.textSecondary}>
          Don{"'"}t have an account?{" "}
        </AppText>
        <Pressable
          onPress={onSignUp || (() => console.log("Sign up"))}
          hitSlop={8}
          disabled={isLoading}
        >
          <AppText
            variant="caption"
            weight="600"
            color={colors.primary}
            style={{ fontSize: 12, lineHeight: 16 }}
          >
            Sign up
          </AppText>
        </Pressable>
      </View>

      {/* 12. Flexible spacer */}
      <View style={{ flex: 1, minHeight: spacing.xl }} />

      {/* 13. Primary Sign In & Social Buttons */}
      <View style={{ width: "100%", alignSelf: "stretch" }}>
        <Button
          variant="primary"
          shape="pill"
          label={isLoading ? "Signing In..." : "Sign In"}
          onPress={handleSignIn}
          disabled={isLoading || isGoogleLoading}
        />

        <View style={{ height: spacing.md }} />
        <DividerWithLabel label="or" />
        <View style={{ height: spacing.md }} />

        <Button
          variant="outline"
          shape="pill"
          leftIcon={<GoogleIcon size={20} />}
          label={isGoogleLoading ? "Signing in..." : "Continue with Google"}
          onPress={signInWithGoogle}
          disabled={isLoading || isGoogleLoading}
        />
      </View>

      {/* 14. Bottom margin */}
      <View style={{ height: spacing.xl }} />

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={handleErrorDismiss}
      />
    </Screen>
  );
}
