import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPostCard from './SkeletonPostCard';
import { spacing } from '../../theme/spacing';

const SkeletonFeed = ({ count = 4 }) => (
  <View style={styles.wrap}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonPostCard key={i} showImage={i % 3 === 1} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});

export default SkeletonFeed;
