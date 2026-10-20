import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { AppText, Avatar } from "@/components/ui";

export interface HeaderSectionProps {
  userName: string;
  onAvatarPress?: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  userName,
  onAvatarPress,
}) => {
  const initial = userName.trim() ? userName.trim().charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <AppText variant="screenTitle" style={styles.greetingText}>
          Hi, {userName || "there"}
        </AppText>
      </View>

      <Pressable
        onPress={onAvatarPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Profile for ${userName}`}
        style={styles.avatarWrapper}
      >
        <Avatar
          size={42}
          initials={initial}
          backgroundColor={colors.brand.soft}
          textColor={colors.brand.primary}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.text.primary,
  },
  avatarWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
