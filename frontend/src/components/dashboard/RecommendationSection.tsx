import React, { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { AppText } from "@/components/ui";
import {
  RecommendationCard,
  RecommendationCardItem,
} from "./RecommendationCard";

export type RecommendationItem = RecommendationCardItem & {
  variant?: "nutrition" | "activity" | "sleep" | "hydration";
};

export interface RecommendationSectionProps {
  items: RecommendationItem[];
  onSeeAllPress?: () => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  items,
  onSeeAllPress,
}) => {
  const [cardWidth, setCardWidth] = useState<number | undefined>(undefined);

  const handleLayout = (e: LayoutChangeEvent) => {
    const containerWidth = e.nativeEvent.layout.width;
    if (containerWidth > 0) {
      const computed = Math.floor((containerWidth - spacing.md) / 2);
      if (computed !== cardWidth) {
        setCardWidth(computed);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="cardTitle" weight="700" style={styles.sectionTitle}>
          Today{"'"}s recommendation
        </AppText>
        <Pressable
          onPress={onSeeAllPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all recommendations"
        >
          <AppText variant="link" style={styles.seeAllText}>
            See All
          </AppText>
        </Pressable>
      </View>

      <View style={styles.grid} onLayout={handleLayout}>
        {items.map((item) => (
          <RecommendationCard
            key={item.id}
            item={item}
            width={cardWidth}
            onPress={item.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
  },
  seeAllText: {
    color: colors.brand.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
