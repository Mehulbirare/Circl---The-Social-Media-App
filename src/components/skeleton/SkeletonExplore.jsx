import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Skeleton from './Skeleton';
import SkeletonUserCard from './SkeletonUserCard';
import { spacing } from '../../theme/spacing';

const SkeletonExplore = () => (
  <View style={styles.wrap}>
    <Skeleton width={160} height={18} style={styles.title} />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsRow}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} width={80} height={32} radius={24} style={styles.pill} />
      ))}
    </ScrollView>

    <Skeleton width={140} height={18} style={styles.titleSpaced} />
    <SkeletonUserCard.List count={4} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.lg,
  },
  title: { marginBottom: spacing.md },
  titleSpaced: { marginTop: spacing.xl, marginBottom: spacing.md },
  pillsRow: { paddingRight: spacing.lg },
  pill: { marginRight: spacing.sm },
});

export default SkeletonExplore;
