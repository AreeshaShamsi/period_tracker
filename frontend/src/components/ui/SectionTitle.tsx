import React from "react";
import { TextStyle } from "react-native";
import { AppText } from "./AppText";

export interface SectionTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  style,
}) => {
  return (
    <AppText variant="sectionTitle" style={style}>
      {children}
    </AppText>
  );
};
