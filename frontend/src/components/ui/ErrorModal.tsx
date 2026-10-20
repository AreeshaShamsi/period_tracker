import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { AppText } from "./AppText";
import { Button } from "./Button";

export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose?: () => void;
  onDismiss?: () => void;
  buttonText?: string;
  testID?: string;
}

/**
 * Reusable modal popup for authentication and general application errors.
 *
 * Guarantees:
 * - Clear, accessible presentation on Android, iOS, and Web.
 * - Prominent "OK" dismissal button.
 * - Dismissing closes ONLY the popup without modifying form inputs,
 *   without triggering auth side-effects, and without unintended navigation.
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = "Notice",
  message,
  onClose,
  onDismiss,
  buttonText = "OK",
  testID = "error-modal",
}) => {
  if (!visible) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else if (onDismiss) onDismiss();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay} testID={testID}>
        {/* Semi-transparent backdrop dismissing the popup on tap */}
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss error dialog"
        />

        {/* Dialog card */}
        <View
          style={styles.dialogCard}
          accessibilityRole="alert"
          accessibilityLabel={title ? `${title}: ${message}` : message}
        >
          {title ? (
            <AppText
              variant="heading"
              weight="700"
              color={colors.textPrimary}
              style={styles.title}
            >
              {title}
            </AppText>
          ) : null}

          <AppText
            variant="body"
            color={colors.textSecondary}
            style={styles.message}
          >
            {message}
          </AppText>

          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              shape="pill"
              label={buttonText}
              onPress={handleClose}
              testID={`${testID}-ok-button`}
              accessibilityLabel={buttonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    // Elevation for Android
    elevation: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
    fontSize: 18,
    lineHeight: 24,
  },
  message: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    width: "100%",
  },
});
