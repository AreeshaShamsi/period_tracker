import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { CheckIcon } from "@/components/icons";
import { AppText } from "./AppText";

export interface CheckboxProps {
  checked: boolean;
  onToggle?: () => void;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  onChange,
  children,
  label,
  disabled = false,
  style,
  className = "",
}) => {
  const handlePress = () => {
    if (disabled) return;
    if (onToggle) {
      onToggle();
    } else if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      className={className}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.checkbox,
          borderWidth: checked ? 0 : 1.5,
          borderColor: checked ? "transparent" : colors.separator,
          backgroundColor: checked ? colors.primary : colors.white,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <CheckIcon size={12} color={colors.white} />}
      </View>
      {(children || label) && (
        <View
          style={{
            marginLeft: 10,
            flexShrink: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {children ? children : <AppText variant="bodySmall">{label}</AppText>}
        </View>
      )}
    </Pressable>
  );
};
