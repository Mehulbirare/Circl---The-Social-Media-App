import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const Loader = ({ size = 'large', fullscreen = true }) => (
  <View style={fullscreen ? styles.fullscreen : styles.inline}>
    <ActivityIndicator size={size} color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;
