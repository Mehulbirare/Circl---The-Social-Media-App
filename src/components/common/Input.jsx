import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
        ]}
      >
        {leftIcon ? (
          <Icon
            name={leftIcon}
            size={20}
            color={focused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.rightIcon}
          >
            <Icon
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 52,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: spacing.lg,
    },
    inputRowFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    leftIcon: {
      marginRight: spacing.md,
    },
    rightIcon: {
      marginLeft: spacing.sm,
      padding: spacing.xs,
    },
    input: {
      flex: 1,
      height: '100%',
      fontSize: typography.size.md,
      color: colors.textPrimary,
      padding: 0,
    },
  });

export default Input;
