import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export interface AuthFooterLinkProps {
  prompt?: string;
  linkTitle: string;
  onPress: () => void;
  style?: ViewStyle;
  className?: string;
}

export const AuthFooterLink: React.FC<AuthFooterLinkProps> = ({
  prompt,
  linkTitle,
  onPress,
  style,
  className = "",
}) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
      className={className}
    >
      {prompt ? (
        <AppText variant="subheadline" color={colors.text.secondary}>
          {prompt}
        </AppText>
      ) : null}
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={linkTitle}
      >
        <AppText variant="subheadline" weight="600" color={colors.brand.primary}>
          {linkTitle}
        </AppText>
      </Pressable>
    </View>
  );
};
