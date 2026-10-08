import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { sizes } from "@/theme/sizes";
import { IconName } from "@/theme/icons";
import { AppIcon } from "./AppIcon";
import { AppText } from "./AppText";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";
export type ButtonSize = "small" | "medium" | "large";

export interface AppButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  iconColor?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  iconColor,
  fullWidth = true,
  style,
  className = "",
  onPress,
  accessibilityLabel,
  ...props
}) => {
  const isInteractive = !disabled && !loading;

  const height = sizes.buttonHeight[size];

  const getVariantStyles = (pressed: boolean): { bg: string; border?: string; textColor: string; iconColor: string } => {
    switch (variant) {
      case "primary":
        return {
          bg: disabled ? colors.semantic.disabled : pressed ? "#E04875" : colors.brand.primary,
          textColor: colors.white,
          iconColor: iconColor || colors.white,
        };
      case "secondary":
        return {
          bg: disabled ? colors.background.secondary : pressed ? "#FCD5E2" : colors.brand.light,
          textColor: disabled ? colors.text.tertiary : colors.brand.primary,
          iconColor: iconColor || (disabled ? colors.text.tertiary : colors.brand.primary),
        };
      case "outline":
        return {
          bg: pressed ? colors.background.secondary : "transparent",
          border: disabled ? colors.border.subtle : colors.border.primary,
          textColor: disabled ? colors.text.tertiary : colors.text.primary,
          iconColor: iconColor || (disabled ? colors.text.tertiary : colors.text.primary),
        };
      case "destructive":
        return {
          bg: disabled ? colors.semantic.disabled : pressed ? "#D32F2F" : colors.system.red,
          textColor: colors.white,
          iconColor: iconColor || colors.white,
        };
      case "ghost":
        return {
          bg: pressed ? colors.brand.soft : "transparent",
          textColor: disabled ? colors.text.tertiary : colors.brand.primary,
          iconColor: iconColor || (disabled ? colors.text.tertiary : colors.brand.primary),
        };
    }
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => {
        const v = getVariantStyles(pressed);
        return [
          {
            height,
            minHeight: sizes.touchTarget,
            borderRadius: radius.medium,
            backgroundColor: v.bg,
            borderColor: v.border,
            borderWidth: v.border ? 1 : 0,
            alignSelf: fullWidth ? "stretch" : "flex-start",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: size === "small" ? 16 : size === "large" ? 24 : 20,
            opacity: disabled && variant !== "primary" && variant !== "secondary" ? 0.5 : 1,
          },
          style,
        ];
      }}
      className={className}
      {...props}
    >
      {({ pressed }) => {
        const v = getVariantStyles(pressed);
        const iconSize = sizes.icon.medium;

        return (
          <>
            {loading ? (
              <ActivityIndicator color={v.textColor} size="small" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {leftIcon && <AppIcon name={leftIcon} size={iconSize} color={v.iconColor} />}
                <AppText variant="callout" weight="600" color={v.textColor} style={{ fontSize: 14 }}>
                  {title}
                </AppText>
                {rightIcon && <AppIcon name={rightIcon} size={iconSize} color={v.iconColor} />}
              </View>
            )}
          </>
        );
      }}
    </Pressable>
  );
};
