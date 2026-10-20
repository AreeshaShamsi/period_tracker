import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { shadows } from "@/theme/shadows";
import { AppText } from "@/components/ui";

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
}

export interface MoodSectionProps {
  selectedMoodId?: string;
  onSelectMood?: (moodId: string) => void;
}

const DEFAULT_MOODS: MoodOption[] = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "calm", emoji: "😌", label: "Calm" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "cramps", emoji: "😣", label: "Cramps" },
  { id: "sad", emoji: "😢", label: "Sad" },
];

export const MoodSection: React.FC<MoodSectionProps> = ({
  selectedMoodId,
  onSelectMood,
}) => (
  <View style={styles.container}>
    <View style={styles.titleWrapper}>
      <AppText variant="cardTitle" style={styles.titleText}>
        How do you feel today ?
      </AppText>
      <View style={styles.underline} />
    </View>

    <View style={styles.moodRow}>
      {DEFAULT_MOODS.map((mood) => {
        const isSelected = selectedMoodId === mood.id;
        return (
          <Pressable
            key={mood.id}
            onPress={() => onSelectMood?.(mood.id)}
            accessibilityRole="button"
            accessibilityLabel={`Feeling ${mood.label}`}
            style={[styles.moodCard, isSelected && styles.moodCardSelected]}
          >
            <AppText style={styles.emojiText}>{mood.emoji}</AppText>
            <AppText
              variant="caption"
              style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}
            >
              {mood.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginVertical: spacing.sm, paddingBottom: spacing.sm },
  titleWrapper: { alignSelf: "flex-start", marginBottom: spacing.md },
  titleText: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  underline: {
    height: 3,
    width: "45%",
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  moodRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moodCard: {
    width: 60,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  moodCardSelected: {
    backgroundColor: colors.brand.soft,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  emojiText: { fontSize: 24, marginBottom: 4 },
  moodLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: "500" },
  moodLabelSelected: { color: colors.brand.primary, fontWeight: "700" },
});
