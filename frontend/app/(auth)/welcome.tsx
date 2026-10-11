import React from "react";
import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import {
  AppleIcon,
  GoogleIcon,
  LunariLogo,
  MailIcon,
} from "@/components/auth";
import {
  AppText,
  Button,
  DividerWithLabel,
  Screen,
  TextLink,
} from "@/components/ui";

export interface WelcomeScreenProps {
  onApple?: () => void;
  onGoogle?: () => void;
  onEmail?: () => void;
  onSignIn?: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

export default function WelcomeScreen({
  onApple,
  onGoogle,
  onEmail,
  onSignIn,
  onPrivacy,
  onTerms,
}: WelcomeScreenProps) {
  const router = useRouter();

  const handleApple = () => {
    if (onApple) {
      onApple();
    } else {
      console.log("Apple Sign In pressed");
      Alert.alert("Apple Sign In", "Coming soon");
    }
  };

  const handleGoogle = () => {
    if (onGoogle) {
      onGoogle();
    } else {
      console.log("Google Sign In pressed");
      Alert.alert("Google Sign In", "Coming soon");
    }
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail();
    } else {
      console.log("Continue with Email pressed");
      router.push("/(auth)/sign-up");
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      console.log("Sign in pressed");
      router.push("/(auth)/sign-in");
    }
  };

  const handlePrivacy = () => {
    if (onPrivacy) {
      onPrivacy();
    } else {
      console.log("Privacy Policy pressed");
      Alert.alert("Privacy Policy", "Privacy policy details coming soon");
    }
  };

  const handleTerms = () => {
    if (onTerms) {
      onTerms();
    } else {
      console.log("Terms of Service pressed");
      Alert.alert("Terms of Service", "Terms of service details coming soon");
    }
  };

  return (
    <Screen scrollable={false} paddingHorizontal backgroundColor={colors.white}>
      <View style={{ flex: 1, alignItems: "center" }}>
        {/* 1. Top spacing: 80px below safe-area top */}
        <View style={{ height: spacing.huge }} />

        {/* 2. AppLogo / LunariLogo size 64 */}
        <LunariLogo size={64} />

        {/* 3. 24px gap */}
        <View style={{ height: spacing.xl }} />

        {/* 4. Title: "Let's Get Started!" */}
        <AppText variant="title">Let{"'"}s Get Started!</AppText>

        {/* 5. 8px gap */}
        <View style={{ height: spacing.sm }} />

        {/* 6. Subtitle: max width ~260px, 2 lines */}
        <View style={{ maxWidth: 260 }}>
          <AppText variant="subtitle">
            Your health, your cycle,{"\n"}your wellness journey.
          </AppText>
        </View>

        {/* 7. 60px gap */}
        <View style={{ height: spacing.gap60 }} />

        {/* 8. Button stack (12px gap using className mt-3), full width */}
        <View className="w-full self-stretch">
          {/* TODO: hide Apple button on Android if native Apple Auth is not supported */}
          <Button
            variant="dark"
            leftIcon={<AppleIcon size={20} />}
            label="Sign in with Apple"
            onPress={handleApple}
          />
          <Button
            variant="outline"
            className="mt-3"
            leftIcon={<GoogleIcon size={20} />}
            label="Continue with Google"
            onPress={handleGoogle}
          />
          <Button
            variant="outline"
            className="mt-3"
            leftIcon={<MailIcon size={22} />}
            label="Continue with Email"
            onPress={handleEmail}
          />
        </View>

        {/* 9. 64px gap */}
        <View style={{ height: spacing.gap64 }} />

        {/* 10. DividerWithLabel */}
        <DividerWithLabel label="Already have an account?" />

        {/* 11. 12px gap */}
        <View style={{ height: spacing.md }} />

        {/* 12. TextLink "Sign in" */}
        <TextLink label="Sign in" onPress={handleSignIn} />

        {/* 13. Flexible spacer */}
        <View style={{ flex: 1 }} />

        {/* 14. Footer row (24px above bottom safe area) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          <Pressable onPress={handlePrivacy} hitSlop={8}>
            <AppText variant="footer">Privacy Policy</AppText>
          </Pressable>
          <AppText variant="footer">•</AppText>
          <Pressable onPress={handleTerms} hitSlop={8}>
            <AppText variant="footer">Terms of Service</AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
