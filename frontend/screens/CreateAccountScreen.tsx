import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { LockIcon, MailIcon } from "@/components/icons";
import {
  AppText,
  Button,
  Checkbox,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Initial state: checked = true (to match the design)
  // TODO: default agreed to false in production
  const [agreed, setAgreed] = useState(true);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Back pressed");
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      console.log("Sign Up pressed", { email, password, confirmPassword, agreed });
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      console.log("Sign In pressed");
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

      {/* 7. Email Field */}
      <TextField
        label="Email"
        placeholder="you@example.com"
        leftIcon={<MailIcon color={colors.inputIcon} size={20} />}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* 8. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 9. Password Field */}
      <TextField
        label="Password"
        placeholder="Create a password"
        leftIcon={<LockIcon color={colors.inputIcon} size={20} />}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* 10. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 11. Confirm Password Field */}
      <TextField
        label="Confirm Password"
        placeholder="Confirm your password"
        leftIcon={<LockIcon color={colors.inputIcon} size={20} />}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* 12. 20px gap */}
      <View style={{ height: 20 }} />

      {/* 13. Terms Checkbox */}
      <Checkbox checked={agreed} onToggle={() => setAgreed(!agreed)}>
        <AppText variant="bodySmall" color={colors.textPrimary}>
          I agree to Lunari{" "}
        </AppText>
        <Pressable onPress={handleTerms} hitSlop={4}>
          <AppText variant="bodySmall" color={colors.primary}>
            Terms & Conditions.
          </AppText>
        </Pressable>
      </Checkbox>

      {/* 14. 24px gap */}
      <View style={{ height: spacing.xl }} />

      {/* 15. CENTERED row: Already have an account? Sign in */}
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
        <Pressable onPress={handleSignIn} hitSlop={8}>
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

      {/* 16. Flexible spacer pushing the button to the bottom */}
      <View style={{ flex: 1, minHeight: spacing.xl }} />

      {/* 17. Primary Sign Up Button */}
      <View style={{ width: "100%", alignSelf: "stretch" }}>
        <Button
          variant="primary"
          shape="pill"
          label="Sign Up"
          onPress={handleSignUp}
          disabled={!agreed}
        />
      </View>

      {/* 18. Bottom margin: spacing.xl (24) */}
      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}
