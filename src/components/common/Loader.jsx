import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useColors, useThemedStyles } from '../../theme/useColors';

const Loader = ({ size = 'large', fullscreen = true }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={fullscreen ? styles.fullscreen : styles.inline}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
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
