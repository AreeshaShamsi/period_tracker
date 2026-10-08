import React from "react";
import { Image, ImageSourcePropType, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { sizes } from "@/theme/sizes";
import { AppText } from "./AppText";

export interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  initials?: string;
  size?: "small" | "medium" | "large" | number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = "medium",
  backgroundColor = colors.brand.soft,
  textColor = colors.brand.primary,
  style,
  className = "",
}) => {
  const dimension =
    typeof size === "number"
      ? size
      : size === "small"
      ? sizes.avatar.small
      : size === "large"
      ? sizes.avatar.large
      : sizes.avatar.medium;

  const fontVariant = size === "small" ? "caption" : size === "large" ? "title3" : "callout";

  return (
    <View
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        style,
      ]}
      className={className}
      accessibilityRole="image"
      accessibilityLabel={initials ? `Avatar for ${initials}` : "User avatar"}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <AppText variant={fontVariant} weight="600" color={textColor}>
          {initials ? initials.slice(0, 2).toUpperCase() : "?"}
        </AppText>
      )}
    </View>
  );
};
