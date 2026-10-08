import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/theme/colors';

export interface DividerWithLabelProps {
  label: string;
}

export type Props = DividerWithLabelProps;

export const DividerWithLabel = ({ label }: Props) => (
  <View style={styles.root}>
    <View style={styles.line} pointerEvents="none" />
    <View style={styles.labelWrap}>
      <AppText variant="caption" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 9,                       // vertically centered in the 20px row
    height: 1,
    backgroundColor: '#D1D5DB',   // clearly visible light gray
    zIndex: 0,
  },
  labelWrap: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: colors.white,   // pure white primitive string (#FFFFFF)
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
});
