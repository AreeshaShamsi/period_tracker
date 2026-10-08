import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { sizes } from "@/theme/sizes";
import { AuthFooterLink, AuthHeader } from "@/components/auth";
import { AppButton, AppCard, AppIcon, AppInput, AppText, Screen } from "@/components/ui";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendResetLink = () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    } else if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitted(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/sign-in");
    }
  };

  return (
    <Screen scrollable paddingHorizontal backgroundColor={colors.white}>
      <AuthHeader
        title="Forgot Password?"
        subtitle={
          !isSubmitted
            ? "Enter your email address and we'll send you\na link to reset your password."
            : undefined
        }
        onBack={handleBack}
      />

      {!isSubmitted ? (
        /* Form View */
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <AppInput
              label="Email"
              placeholder="you@example.com"
              leftIcon="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              error={emailError}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <AppButton
              title="Send Reset Link"
              variant="primary"
              onPress={handleSendResetLink}
              style={{
                height: sizes.buttonHeight.medium,
                borderRadius: radius.medium,
                marginTop: 12,
              }}
            />
          </View>

          <View style={{ marginVertical: 20 }}>
            <AuthFooterLink
              linkTitle="Back to Sign In"
              onPress={() => router.push("/(auth)/sign-in")}
            />
          </View>
        </View>
      ) : (
        /* Success Card View */
        <View style={{ flex: 1, justifyContent: "center", paddingVertical: 16 }}>
          <AppCard
            variant="soft"
            cardRadius="large"
            style={{
              backgroundColor: colors.brand.soft,
              borderRadius: radius.large,
              padding: 20,
              minHeight: 140,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 1.5,
                borderColor: colors.brand.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <AppIcon name="check" size={24} color={colors.brand.primary} />
            </View>

            <AppText
              variant="title3"
              weight="700"
              align="center"
              color={colors.text.primary}
              style={{ fontSize: 18, marginBottom: 6 }}
            >
              Check your email
            </AppText>

            <AppText
              variant="caption"
              color={colors.text.secondary}
              align="center"
              style={{ fontSize: 13, lineHeight: 18 }}
            >
              We{"'"}ve sent a password reset link{"\n"}to{" "}
              <AppText variant="caption" weight="600" color={colors.text.primary} style={{ fontSize: 13 }}>
                {email}
              </AppText>
              .
            </AppText>
          </AppCard>

          <AuthFooterLink
            linkTitle="Back to Sign In"
            onPress={() => router.push("/(auth)/sign-in")}
          />
        </View>
      )}
    </Screen>
  );
}
