import React, { useState } from "react";
import { Platform, TextInput, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export interface BigTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}

export const BigTextInput: React.FC<BigTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const webStyle = Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {};

  return (
    <View
      style={{
        width: "100%",
        height: 64,
        borderRadius: radius.bigInput,
        backgroundColor: isFocused ? colors.white : colors.inputBg,
        borderWidth: 1,
        borderColor: isFocused ? colors.primary : "transparent",
        paddingHorizontal: spacing.lg,
        justifyContent: "center",
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        autoFocus={autoFocus}
        autoCapitalize="words"
        maxLength={30}
        returnKeyType="done"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          typography.bigInput,
          {
            width: "100%",
            textAlign: "center",
            textAlignVertical: "center",
            paddingVertical: 0,
            paddingHorizontal: 0,
            includeFontPadding: false,
          },
          webStyle,
        ]}
      />
    </View>
  );
};
