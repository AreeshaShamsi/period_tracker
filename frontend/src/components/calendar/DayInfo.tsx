import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { calendarTokens } from "@/theme/sizes";
import { spacing } from "@/theme/spacing";
import { POPPINS_FONTS, typography } from "@/theme/typography";
import { AppText } from "@/components/ui/AppText";
import { OutlineButton } from "./OutlineButton";
import { Badge, BadgeVariant } from "./Badge";

export interface DayInfoProps {
  dateTitle: string; // e.g. "Aug 17"
  subtitle: string; // e.g. "Cycle Day 2 - Menstrual Phase"
  chanceVariant: BadgeVariant | string; // "Medium" | "High" | "Low"
  onEditPress?: () => void;
}

export const DayInfo: React.FC<DayInfoProps> = ({
  dateTitle,
  subtitle,
  chanceVariant,
  onEditPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Row: Date title & subtitle (Left) + Edit pill button (Right, vertically centered with title block) */}
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <AppText style={styles.dateTitleText}>
            {dateTitle}
          </AppText>
          <AppText style={styles.subtitleText}>
            {subtitle}
          </AppText>
        </View>

        <OutlineButton label="Edit" onPress={onEditPress} />
      </View>

      {/* Badge row below with consistent gap */}
      <View style={styles.chanceRow}>
        <Badge variant={chanceVariant} />
        <AppText style={styles.chanceText}>
          - Chance of getting pregnant
        </AppText>
      </View>

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.white,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center", // Vertically centered with the title block
    justifyContent: "space-between",
    width: "100%",
  },
  titleColumn: {
    flex: 1,
    justifyContent: "center",
  },
  dateTitleText: {
    fontFamily: POPPINS_FONTS.semibold, // Section-title token
    fontSize: typography.sectionTitle.fontSize ?? 16,
    lineHeight: 22,
    color: colors.calendar.textMain, // #202124
  },
  subtitleText: {
    fontFamily: POPPINS_FONTS.regular, // Muted token
    fontSize: typography.subheadline.fontSize ?? 12,
    color: colors.calendar.textSecondary, // #777777 (muted gray)
    marginTop: spacing.xs, // 4px
  },
  chanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm, // 8px
    marginTop: calendarTokens.badgeRowGap, // Consistent gap below title row (12px)
  },
  chanceText: {
    fontFamily: POPPINS_FONTS.regular,
    fontSize: calendarTokens.typography.chanceText, // 11.5px
    color: colors.calendar.textSecondary, // #777777 (muted gray)
  },
  divider: {
    height: calendarTokens.dividerHeight, // 1px divider
    backgroundColor: calendarTokens.gridBorderColor, // Lightest existing border token (#EEEEEE)
    marginTop: calendarTokens.dividerMarginTop, // 12px
    width: "100%",
  },
});
