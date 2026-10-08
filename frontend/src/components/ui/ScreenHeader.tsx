import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { ChevronLeftIcon } from "@/components/icons";

export interface ScreenHeaderProps {
  onBack: () => void;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ onBack, style }) => {
  return (
    <View
      style={[
        {
          height: 52,
          paddingTop: spacing.sm,
          justifyContent: "center",
          alignItems: "flex-start",
        },
        style,
      ]}
    >
      <Pressable
        onPress={onBack}
        hitSlop={14}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={{
          paddingRight: spacing.md,
          paddingVertical: spacing.xs,
        }}
      >
        <ChevronLeftIcon size={24} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
};
