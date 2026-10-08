import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { sizes } from "@/theme/sizes";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  align?: "left" | "center";
  style?: ViewStyle;
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  onBack,
  align = "left",
  style,
  className = "",
}) => {
  const isCentered = align === "center";

  return (
    <View style={[{ marginBottom: 28 }, style]} className={className}>
      {onBack && (
        <View style={{ paddingTop: 8, paddingBottom: 16, alignItems: "flex-start" }}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{
              width: sizes.touchTarget,
              height: sizes.touchTarget,
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <AppIcon name="back" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
      )}

      <AppText
        variant="title1"
        weight="700"
        align={align}
        color={colors.text.primary}
        style={{ fontSize: 28, lineHeight: 34, marginBottom: subtitle ? 8 : 0 }}
      >
        {title}
      </AppText>

      {subtitle && (
        <AppText
          variant="subheadline"
          align={align}
          color={colors.text.secondary}
          style={{ lineHeight: 22 }}
        >
          {subtitle}
        </AppText>
      )}
    </View>
  );
};
