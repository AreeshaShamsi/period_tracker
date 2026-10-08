import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Button } from "@/components/ui/Button";
import { AppleIcon, GoogleIcon, MailIcon } from "./AuthIcons";

export type AuthSocialProvider = "apple" | "google" | "email";

export interface AuthSocialButtonProps {
  provider: AuthSocialProvider;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
  provider,
  label,
  onPress,
  disabled = false,
  style,
  className = "",
}) => {
  switch (provider) {
    case "apple":
      return (
        <Button
          variant="dark"
          leftIcon={<AppleIcon size={20} />}
          label={label || "Sign in with Apple"}
          onPress={onPress}
          disabled={disabled}
          style={style}
          className={className}
        />
      );

    case "google":
      return (
        <Button
          variant="outline"
          leftIcon={<GoogleIcon size={20} />}
          label={label || "Continue with Google"}
          onPress={onPress}
          disabled={disabled}
          style={style}
          className={className}
        />
      );

    case "email":
      return (
        <Button
          variant="outline"
          leftIcon={<MailIcon size={22} />}
          label={label || "Continue with Email"}
          onPress={onPress}
          disabled={disabled}
          style={style}
          className={className}
        />
      );
  }
};
