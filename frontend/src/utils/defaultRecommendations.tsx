import { RecommendationItem } from "@/components/dashboard/RecommendationSection";

export function getDefaultRecommendations(
  onNutritionPress?: () => void,
  onActivityPress?: () => void,
  onSleepPress?: () => void,
  onSelfCarePress?: () => void
): RecommendationItem[] {
  return [
    {
      id: "rec-nutrition",
      title: "Nutrition",
      description: "Magnesium-rich foods for cramps",
      icon: require("../../assets/icons/recommendations/nutrition.png"),
      onPress: onNutritionPress,
    },
    {
      id: "rec-activity",
      title: "Activity",
      description: "Light yoga & restorative walks",
      icon: require("../../assets/icons/recommendations/activity.png"),
      onPress: onActivityPress,
    },
    {
      id: "rec-sleep",
      title: "Sleep",
      description: "Restful sleep for cycle balance",
      icon: require("../../assets/icons/recommendations/rest-sleep.png"),
      onPress: onSleepPress,
    },
    {
      id: "rec-self-care",
      title: "Self-care",
      description: "Try a warm compress for cramps.",
      icon: require("../../assets/icons/recommendations/self-care.png"),
      onPress: onSelfCarePress,
    },
  ];
}
