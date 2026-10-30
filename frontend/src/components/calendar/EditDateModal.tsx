import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { AppText } from "@/components/ui/AppText";
import { CheckIcon, DropIcon } from "@/components/icons";
import { formatSelectedDateHeader } from "@/utils/calendarHelpers";

const SYMPTOM_OPTIONS = [
  { id: "cramps", label: "Cramps" },
  { id: "headache", label: "Headache" },
  { id: "bloating", label: "Bloating" },
  { id: "back_pain", label: "Back pain" },
  { id: "breast_tenderness", label: "Breast tenderness" },
  { id: "acne", label: "Acne" },
  { id: "mood", label: "Mood swings" },
  { id: "energy", label: "Fatigue" },
  { id: "sleep", label: "Insomnia" },
];

interface EditDateFormProps {
  iso: string;
  initialIsPeriod: boolean;
  initialSymptoms: string[];
  onClose: () => void;
  onSave: (iso: string, isPeriod: boolean, symptoms: string[]) => void;
}

const EditDateForm: React.FC<EditDateFormProps> = ({
  iso,
  initialIsPeriod,
  initialSymptoms,
  onClose,
  onSave,
}) => {
  const [isPeriod, setIsPeriod] = useState<boolean>(initialIsPeriod);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = () => {
    onSave(iso, isPeriod, selectedSymptoms);
    onClose();
  };

  const dateTitle = formatSelectedDateHeader(iso);

  return (
    <View style={styles.sheetCard}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <AppText variant="title3" style={styles.titleText}>
            Edit Log
          </AppText>
          <AppText style={styles.dateSubtext}>{dateTitle}</AppText>
        </View>

        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.closeButton}
        >
          <AppText style={styles.closeButtonText}>✕</AppText>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        {/* Period Section */}
        <AppText variant="label" style={styles.sectionHeading}>
          Period Flow
        </AppText>

        <Pressable
          onPress={() => setIsPeriod((prev) => !prev)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isPeriod }}
          style={[
            styles.periodToggleCard,
            isPeriod && styles.periodToggleCardActive,
          ]}
        >
          <View style={styles.periodIconWrapper}>
            <DropIcon
              size={20}
              color={isPeriod ? colors.white : colors.calendar.periodFill}
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppText
              style={[
                styles.periodToggleLabel,
                isPeriod && styles.periodToggleLabelActive,
              ]}
            >
              {isPeriod ? "Period Logged for this day" : "No Period"}
            </AppText>
            <AppText style={styles.periodToggleHelper}>
              Tap to {isPeriod ? "remove" : "record"} period flow
            </AppText>
          </View>

          <View
            style={[
              styles.checkboxCircle,
              isPeriod && styles.checkboxCircleActive,
            ]}
          >
            {isPeriod && <CheckIcon size={12} color={colors.white} />}
          </View>
        </Pressable>

        {/* Symptoms Section */}
        <AppText variant="label" style={styles.sectionHeading}>
          Symptoms
        </AppText>

        <View style={styles.symptomsGrid}>
          {SYMPTOM_OPTIONS.map((item) => {
            const active = selectedSymptoms.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => toggleSymptom(item.id)}
                style={[
                  styles.symptomChip,
                  active && styles.symptomChipActive,
                ]}
              >
                <AppText
                  style={[
                    styles.symptomChipText,
                    active && styles.symptomChipTextActive,
                  ]}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={styles.cancelButton}
        >
          <AppText style={styles.cancelButtonText}>Cancel</AppText>
        </Pressable>

        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save Changes"
          style={styles.saveButton}
        >
          <AppText style={styles.saveButtonText}>Save Changes</AppText>
        </Pressable>
      </View>
    </View>
  );
};

export interface EditDateModalProps {
  visible: boolean;
  iso: string;
  initialIsPeriod: boolean;
  initialSymptoms: string[];
  onClose: () => void;
  onSave: (iso: string, isPeriod: boolean, symptoms: string[]) => void;
}

export const EditDateModal: React.FC<EditDateModalProps> = ({
  visible,
  iso,
  initialIsPeriod,
  initialSymptoms,
  onClose,
  onSave,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {visible && (
          <EditDateForm
            key={`${iso}-${visible}`}
            iso={iso}
            initialIsPeriod={initialIsPeriod}
            initialSymptoms={initialSymptoms}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: "85%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dateSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.input,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  periodToggleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.background.input,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: spacing.md,
  },
  periodToggleCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.brand.primary,
  },
  periodIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  periodToggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  periodToggleLabelActive: {
    color: colors.brand.primary,
  },
  periodToggleHelper: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.circleBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCircleActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  symptomChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background.input,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  symptomChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.brand.primary,
  },
  symptomChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  symptomChipTextActive: {
    color: colors.brand.primary,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.background.input,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },
});
