import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { AppText } from "@/components/ui";

export interface LogSymptomsButtonProps {
  onPress: () => void;
}

export const LogSymptomsButton: React.FC<LogSymptomsButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Log Your Symptoms"
        style={styles.button}
      >
        <AppText variant="button" style={styles.label}>
          Log Your Symptoms
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.sm,
    width: "100%",
  },
  button: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
