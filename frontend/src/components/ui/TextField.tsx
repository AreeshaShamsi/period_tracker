import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  Platform,
  Pressable,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { AppText } from "./AppText";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  leftIcon: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  style?: ViewStyle;
  editable?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  style,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showSecureText = secureTextEntry && !isPasswordVisible;

  const boxStyle: ViewStyle = {
    flexDirection: "row",
    height: 52,
    borderRadius: radius.input,
    backgroundColor: isFocused ? colors.white : colors.inputBg,
    borderWidth: 1,
    borderColor: isFocused ? colors.primary : "transparent",
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  };

  const webStyle = Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {};

  return (
    <View style={[{ width: "100%" }, style]}>
      <AppText variant="label">{label}</AppText>
      <View style={{ height: spacing.sm }} />

      <View style={boxStyle}>
        {leftIcon}
        <View style={{ width: spacing.md }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={showSecureText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            {
              flex: 1,
              fontSize: 15,
              lineHeight: 20,
              color: colors.textPrimary,
              padding: 0,
            },
            webStyle,
          ]}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeIcon size={20} color={colors.inputIcon} />
            ) : (
              <EyeOffIcon size={20} color={colors.inputIcon} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={{ marginTop: spacing.xs }}>
          <AppText variant="bodySmall" color={colors.danger}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};
