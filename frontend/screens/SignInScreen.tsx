import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useOnboarding } from "@/state/OnboardingContext";
import { LockIcon, MailIcon } from "@/components/icons";
import {
  AppText,
  Button,
  Screen,
  ScreenHeader,
  TextField,
} from "@/components/ui";

export interface SignInScreenProps {
  onBack?: () => void;
  onSignInSuccess?: () => void;
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
  const { onboardingData } = useOnboarding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Back pressed");
    }
  };

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const hasCompletedOnboarding =
      Boolean(onboardingData?.name) &&
      Array.isArray(onboardingData?.lastPeriodDays) &&
      onboardingData.lastPeriodDays.length > 0;

    if (!hasCompletedOnboarding) {
      router.replace("/onboarding" as any);
      return;
    }

    if (onSignInSuccess) {
      onSignInSuccess();
    } else {
      console.log("Signed in successfully!");
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
        <Pressable onPress={onSignUp || (() => console.log("Sign up"))} hitSlop={8}>
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

      {/* 13. Primary Sign In Button */}
      <View style={{ width: "100%", alignSelf: "stretch" }}>
        <Button
          variant="primary"
          shape="pill"
          label="Sign In"
          onPress={handleSignIn}
        />
      </View>

      {/* 14. Bottom margin */}
      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}
