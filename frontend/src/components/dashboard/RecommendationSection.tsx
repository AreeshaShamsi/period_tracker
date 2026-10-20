import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { shadows } from "@/theme/shadows";
import { AppText } from "@/components/ui";

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "nutrition" | "activity";
  onPress?: () => void;
}

export interface RecommendationSectionProps {
  items: RecommendationItem[];
  onSeeAllPress?: () => void;
}

const iconBgStyles = StyleSheet.create({
  nutrition: { backgroundColor: colors.recommendation.nutritionBg },
  activity: { backgroundColor: colors.recommendation.activityBg },
  default: { backgroundColor: colors.brand.soft },
});

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  items,
  onSeeAllPress,
}) => (
  <View style={styles.container}>
    <View style={styles.headerRow}>
      <AppText variant="cardTitle" style={styles.sectionTitle}>
        Today{"'"}s recommendation
      </AppText>
      <Pressable
        onPress={onSeeAllPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="See all recommendations"
      >
        <AppText variant="label" style={styles.seeAllText}>
          See All
        </AppText>
      </Pressable>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {items.map((item) => {
        const bgStyle =
          (item.variant && iconBgStyles[item.variant]) || iconBgStyles.default;

        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}: ${item.description}`}
          >
            <View style={[styles.iconWrapper, bgStyle]}>{item.icon}</View>
            <View style={styles.cardTextContainer}>
              <AppText variant="label" style={styles.cardTitle}>
                {item.title}
              </AppText>
              <AppText variant="caption" numberOfLines={1} style={styles.cardDescription}>
                {item.description}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { marginVertical: spacing.sm },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  seeAllText: { fontSize: 14, fontWeight: "600", color: colors.brand.primary },
  scrollContent: { gap: spacing.md, paddingRight: spacing.sm },
  card: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 2 },
  cardDescription: { fontSize: 12, color: colors.text.secondary },
});
