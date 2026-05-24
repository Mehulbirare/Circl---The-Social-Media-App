import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';

const AVATAR_COLORS = [
  '#1D9E75',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F97316',
];

const Avatar = ({ name = '?', size = 44, uri }) => {
  const trimmed = (name || '?').trim();
  const initial = trimmed.charAt(0).toUpperCase() || '?';
  const code = trimmed.charCodeAt(0) || 0;
  const bg = AVATAR_COLORS[code % AVATAR_COLORS.length];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: typography.weight.bold,
  },
});

export default Avatar;
