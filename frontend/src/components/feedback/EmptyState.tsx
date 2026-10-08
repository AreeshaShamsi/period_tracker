import React from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { IconName } from "@/theme/icons";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "notes",
  title,
  description,
  actionTitle,
  onAction,
  style,
  className = "",
}) => {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          marginVertical: 16,
        },
        style,
      ]}
      className={className}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.brand.soft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <AppIcon name={icon} size={32} color={colors.brand.primary} />
      </View>

      <AppText variant="title3" weight="600" align="center" style={{ marginBottom: 6 }}>
        {title}
      </AppText>

      {description && (
        <AppText
          variant="body"
          color={colors.text.secondary}
          align="center"
          style={{ marginBottom: actionTitle ? 20 : 0 }}
        >
          {description}
        </AppText>
      )}

      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          variant="primary"
          size="medium"
          onPress={onAction}
          fullWidth={false}
        />
      )}
    </View>
  );
};
