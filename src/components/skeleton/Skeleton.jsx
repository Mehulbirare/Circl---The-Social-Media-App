import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useColors } from '../../theme/useColors';

const Skeleton = ({ width = '100%', height = 16, radius = 8, style }) => {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.primaryLight],
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
};

const SkeletonCircle = ({ size = 48, style }) => (
  <Skeleton width={size} height={size} radius={size / 2} style={style} />
);

const SkeletonGroup = ({ children, style }) => (
  <View style={style}>{children}</View>
);

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

Skeleton.Circle = SkeletonCircle;
Skeleton.Group = SkeletonGroup;

export default Skeleton;
