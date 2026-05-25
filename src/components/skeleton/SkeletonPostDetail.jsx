import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import SkeletonComment from './SkeletonComment';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonPostDetail = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Skeleton.Circle size={48} />
        <View style={styles.headerText}>
          <Skeleton width={140} height={14} />
          <Skeleton width={100} height={10} style={styles.gap6} />
        </View>
      </View>
      <Skeleton width="100%" height={18} style={styles.line} />
      <Skeleton width="96%" height={18} style={styles.line} />
      <Skeleton width="70%" height={18} style={styles.line} />
      <Skeleton width="100%" height={220} radius={12} style={styles.image} />
      <View style={styles.actions}>
        <Skeleton width={56} height={20} radius={10} />
        <Skeleton width={56} height={20} radius={10} />
        <Skeleton width={56} height={20} radius={10} />
      </View>
      <Skeleton width={120} height={20} style={styles.title} />
      <SkeletonComment.List count={3} />
    </View>
  );
};

const makeStyles = () =>
  StyleSheet.create({
    wrap: { padding: spacing.lg, paddingBottom: spacing.huge },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    headerText: { marginLeft: spacing.md },
    gap6: { marginTop: 6 },
    line: { marginTop: 8 },
    image: { marginTop: spacing.lg },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    title: { marginTop: spacing.xl, marginBottom: spacing.sm },
  });

export default SkeletonPostDetail;
