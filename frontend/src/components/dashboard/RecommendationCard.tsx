import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { sizes } from "@/theme/sizes";
import { opacity } from "@/theme/opacity";
import { AppText } from "@/components/ui";

export interface RecommendationCardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

export interface RecommendationCardProps {
  item: RecommendationCardItem;
  width?: number;
  onPress?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  width,
  onPress,
}) => {
  const handlePress = onPress ?? item.onPress;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}: ${item.description}`}
      style={({ pressed }) => [
        styles.card,
        width !== undefined ? { width } : styles.fallbackWidth,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.tile}>{item.icon}</View>
      <AppText
        variant="cardTitle"
        weight="700"
        numberOfLines={1}
        style={styles.title}
      >
        {item.title}
      </AppText>
      <AppText
        variant="bodySmall"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={styles.description}
      >
        {item.description}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.recommendation.cardBackground,
    borderRadius: radius.card,
    minHeight: sizes.recommendation.cardMinHeight,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  fallbackWidth: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  cardPressed: {
    borderColor: colors.brand.primary,
    opacity: opacity.pressed,
  },
  tile: {
    width: sizes.recommendation.tile,
    height: sizes.recommendation.tile,
    borderRadius: radius.tile,
    backgroundColor: colors.recommendation.tileBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
