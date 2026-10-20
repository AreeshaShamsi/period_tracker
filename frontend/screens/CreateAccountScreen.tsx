import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { LockIcon, MailIcon } from "@/components/icons";
import { useOnboarding } from "@/state/OnboardingContext";
import { authService } from "@/services/auth.service";
import { signupSchema, getFirstZodError } from "@/schemas/auth.schema";
import {
  AppIcon,
  AppText,
  Button,
  Checkbox,
  ErrorModal,
  Screen,
  ScreenHeader,
  TextField,
} from "@/components/ui";

export interface CreateAccountScreenProps {
  onBack?: () => void;
  onSignUp?: () => void;
  onSignIn?: () => void;
  onTerms?: () => void;
}

export default function CreateAccountScreen({
  onBack,
  onSignUp,
  onSignIn,
  onTerms,
}: CreateAccountScreenProps) {
  const router = useRouter();
  const { onboardingData, setField } = useOnboarding();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
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
    // Closes only the popup without navigating or altering any form inputs or state
    setErrorModal({ visible: false, message: "" });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Back pressed");
    }
  };

  const handleSignUp = async () => {
    if (isLoading) return; // Prevent duplicate submissions

    setError("");

    const validation = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      agreed,
      birthYear: onboardingData?.birthday?.year
        ? Number(onboardingData.birthday.year)
        : undefined,
      averageCycleLength: onboardingData?.cycleLength
        ? Number(onboardingData.cycleLength)
        : undefined,
      averagePeriodDuration: onboardingData?.periodLength
        ? Number(onboardingData.periodLength)
        : undefined,
    });

    if (!validation.success) {
      const valError = getFirstZodError(validation.error);
      setError(valError);
      return;
    }

    const {
      name: validName,
      email: validEmail,
      password: validPassword,
      birthYear,
      averageCycleLength,
      averagePeriodDuration,
    } = validation.data;

    setIsLoading(true);
    try {
      await authService.signup({
        name: validName,
        email: validEmail,
        password: validPassword,
        birthYear,
        averageCycleLength,
        averagePeriodDuration,
      });

      if (validName) {
        setField("name", validName);
      }

      if (onSignUp) {
        onSignUp();
      } else {
        router.replace("/onboarding" as any);
      }
    } catch (err) {
      const errorDetails = authService.getAuthErrorDetails(
        err,
        "Something went wrong. Please try again."
      );
      setError(errorDetails.message);
      // Prevent duplicate popups from repeated taps
      setErrorModal((prev) => {
        if (prev.visible && prev.message === errorDetails.message) return prev;
        return {
          visible: true,
          title: errorDetails.title || "Registration Notice",
          message: errorDetails.message,
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      router.push("/(auth)/sign-in");
    }
  };

  const handleTerms = () => {
    if (onTerms) {
      onTerms();
    } else {
      console.log("Terms & Conditions pressed");
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

      {/* 3. Heading: "Create Account" */}
      <AppText variant="heading">Create Account</AppText>

      {/* 4. 8px gap */}
      <View style={{ height: spacing.sm }} />

      {/* 5. Subtitle: natural break after "control of"; maxWidth ~300 */}
      <View style={{ maxWidth: 300 }}>
        <AppText variant="body">
          Join Lunari and take control of{"\n"}your cycle & wellness.
        </AppText>
      </View>

      {/* 6. 28px gap */}
      <View style={{ height: 28 }} />

      {/* 7. Name Field */}
      <TextField
        label="Name"
        placeholder="Your name"
        leftIcon={<AppIcon name="profile" size={20} color={colors.inputIcon} />}
        autoCapitalize="words"
        value={name}
        editable={!isLoading}
        onChangeText={(text) => {
          setName(text);
          if (error) setError("");
        }}
      />

      {/* 8. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 9. Email Field */}
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

      {/* 10. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 11. Password Field */}
      <TextField
        label="Password"
        placeholder="Create a password"
        leftIcon={<LockIcon color={colors.inputIcon} size={20} />}
        secureTextEntry
        value={password}
        editable={!isLoading}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError("");
        }}
      />

      {/* 12. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 13. Confirm Password Field */}
      <TextField
        label="Confirm Password"
        placeholder="Confirm your password"
        leftIcon={<LockIcon color={colors.inputIcon} size={20} />}
        secureTextEntry
        value={confirmPassword}
        editable={!isLoading}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (error) setError("");
        }}
        error={error}
      />

      {/* 14. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 15. Terms Checkbox */}
      <Checkbox
        checked={agreed}
        onToggle={() => !isLoading && setAgreed(!agreed)}
      >
        <AppText variant="bodySmall" color={colors.textPrimary}>
          I agree to Lunari{" "}
        </AppText>
        <Pressable onPress={handleTerms} hitSlop={4} disabled={isLoading}>
          <AppText variant="bodySmall" color={colors.primary}>
            Terms & Conditions.
          </AppText>
        </Pressable>
      </Checkbox>

      {/* 16. 24px gap */}
      <View style={{ height: spacing.xl }} />

      {/* 17. CENTERED row: Already have an account? Sign in */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppText variant="caption" color={colors.textSecondary}>
          Already have an account?{" "}
        </AppText>
        <Pressable
          onPress={handleSignIn}
          hitSlop={8}
          disabled={isLoading}
        >
          <AppText
            variant="caption"
            weight="600"
            color={colors.primary}
            style={{ fontSize: 12, lineHeight: 16 }}
          >
            Sign in
          </AppText>
        </Pressable>
      </View>

      {/* 18. Flexible spacer pushing the button to the bottom */}
      <View style={{ flex: 1, minHeight: spacing.xl }} />

      {/* 19. Primary Sign Up Button */}
      <View style={{ width: "100%", alignSelf: "stretch" }}>
        <Button
          variant="primary"
          shape="pill"
          label={isLoading ? "Creating Account..." : "Sign Up"}
          onPress={handleSignUp}
          disabled={!agreed || isLoading}
        />
      </View>

      {/* 20. Bottom margin: spacing.xl (24) */}
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
