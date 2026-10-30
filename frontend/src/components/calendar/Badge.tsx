import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export type BadgeVariant = "Medium" | "High" | "Low";

export interface BadgeProps {
  variant: BadgeVariant | string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label }) => {
  const textLabel = label || variant;

  let backgroundColor = colors.calendar.fertileAccent; // orange (#FFA62B)
  let textColor = colors.white;

  if (variant === "High") {
    backgroundColor = colors.calendar.primaryPink; // pink (#F45B91)
    textColor = colors.white;
  } else if (variant === "Low") {
    backgroundColor = colors.calendar.separator; // light gray (#EEEEEE)
    textColor = colors.calendar.textSecondary; // #777777
  }

  return (
    <View style={[styles.pillBadge, { backgroundColor }]}>
      <AppText style={[styles.badgeLabel, { color: textColor }]}>
        {textLabel}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  pillBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
  },
});
