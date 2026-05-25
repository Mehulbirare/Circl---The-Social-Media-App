import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const Button = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      style={[
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline ? styles.textOutline : styles.textPrimary,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    base: {
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
    },
    textPrimary: {
      color: '#FFFFFF',
    },
    textOutline: {
      color: colors.primary,
    },
  });

export default Button;
