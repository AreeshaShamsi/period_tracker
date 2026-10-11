import React, { useState } from "react";
import {
  Pressable,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { sizes } from "@/theme/sizes";
import { IconName } from "@/theme/icons";
import { AppIcon } from "./AppIcon";
import { AppText } from "./AppText";

export interface AppInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  className?: string;
}

export const AppInput = React.forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      secureTextEntry,
      containerStyle,
      className = "",
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const isSecure = secureTextEntry && !isPasswordVisible;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const borderColor = error
      ? colors.system.red
      : isFocused
      ? colors.brand.primary
      : colors.border.primary;

    const backgroundColor = disabled ? colors.background.secondary : colors.white;

    return (
      <View style={[{ width: "100%", marginBottom: 16 }, containerStyle]} className={className}>
        {label && (
          <AppText
            variant="subheadline"
            weight="600"
            color={disabled ? colors.text.tertiary : colors.text.primary}
            style={{ marginBottom: 6 }}
          >
            {label}
          </AppText>
        )}

        <View
          style={{
            height: sizes.inputHeight,
            minHeight: sizes.touchTarget,
            backgroundColor,
            borderWidth: 1.5,
            borderColor,
            borderRadius: radius.medium,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
          }}
        >
          {leftIcon && (
            <View style={{ marginRight: 8 }}>
              <AppIcon
                name={leftIcon}
                size="medium"
                color={error ? colors.system.red : isFocused ? colors.brand.primary : colors.text.tertiary}
              />
            </View>
          )}

          <TextInput
            ref={ref}
            editable={!disabled}
            secureTextEntry={isSecure}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.text.tertiary}
            accessibilityLabel={label || props.placeholder}
            style={{
              flex: 1,
              fontSize: 16,
              color: disabled ? colors.text.tertiary : colors.text.primary,
              height: "100%",
            }}
            {...props}
          />

          {secureTextEntry ? (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Toggle password visibility"
              style={{ paddingLeft: 8 }}
            >
              <AppIcon
                name={isPasswordVisible ? "eye" : "lock"}
                size="medium"
                color={colors.text.tertiary}
              />
            </Pressable>
          ) : rightIcon ? (
            <Pressable
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              hitSlop={8}
              style={{ paddingLeft: 8 }}
            >
              <AppIcon name={rightIcon} size="medium" color={colors.text.tertiary} />
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <AppText variant="caption" color={colors.system.red} style={{ marginTop: 4 }}>
            {error}
          </AppText>
        ) : helperText ? (
          <AppText variant="caption" color={colors.text.secondary} style={{ marginTop: 4 }}>
            {helperText}
          </AppText>
        ) : null}
      </View>
    );
  }
);

AppInput.displayName = "AppInput";
