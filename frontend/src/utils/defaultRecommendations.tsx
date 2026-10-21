import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { RecommendationItem } from "@/components/dashboard/RecommendationSection";

export function getDefaultRecommendations(
  onNutritionPress?: () => void,
  onActivityPress?: () => void,
  onSleepPress?: () => void,
  onHydrationPress?: () => void
): RecommendationItem[] {
  return [
    {
      id: "rec-nutrition",
      title: "Nutrition",
      description: "Magnesium-rich foods for cramps",
      variant: "nutrition",
      icon: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C8 2 4 6 4 10C4 15 12 22 12 22C12 22 20 15 20 10C20 6 16 2 12 2Z"
            fill={colors.recommendation.nutritionTint}
          />
          <Circle cx={12} cy={9} r={3} fill={colors.white} />
        </Svg>
      ),
      onPress: onNutritionPress,
    },
    {
      id: "rec-activity",
      title: "Activity",
      description: "Light yoga & restorative walks",
      variant: "activity",
      icon: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={6} r={3} fill={colors.recommendation.activityTint} />
          <Path
            d="M5 20C5 16 8 13 12 13C16 13 19 16 19 20"
            stroke={colors.recommendation.activityTint}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      ),
      onPress: onActivityPress,
    },
    {
      id: "rec-sleep",
      title: "Sleep",
      description: "Restful sleep for cycle balance",
      variant: "sleep",
      icon: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
            fill={colors.recommendation.sleepTint}
          />
        </Svg>
      ),
      onPress: onSleepPress,
    },
    {
      id: "rec-hydration",
      title: "Hydration",
      description: "Electrolytes & warm herbal tea",
      variant: "hydration",
      icon: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            fill={colors.recommendation.hydrationTint}
          />
        </Svg>
      ),
      onPress: onHydrationPress,
    },
  ];
}
