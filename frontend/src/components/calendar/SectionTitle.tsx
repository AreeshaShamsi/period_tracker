import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export interface SectionTitleProps {
  title: string;
  style?: ViewStyle;
}

/**
 * SectionTitle: Reusable header with muted label text on the left
 * followed by a thin light-gray horizontal line filling the rest of the row.
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ title, style }) => {
  return (
    <View style={[styles.container, style]}>
      <AppText style={styles.titleText}>{title}</AppText>
      <View style={styles.horizontalLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 18,
    marginBottom: 12,
  },
  titleText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.calendar.textSecondary, // #777777 (muted gray)
    marginRight: 12,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEEEEE", // thin light-gray line filling rest of the row
  },
});
