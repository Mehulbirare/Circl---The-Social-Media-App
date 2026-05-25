import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonPostCard = ({ showImage = false }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton.Circle size={48} />
        <View style={styles.headerText}>
          <Skeleton width={140} height={14} />
          <Skeleton width={80} height={10} style={styles.gap6} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={styles.line} />
      <Skeleton width="92%" height={14} style={styles.line} />
      <Skeleton width="60%" height={14} style={styles.line} />
      {showImage && <Skeleton width="100%" height={180} radius={12} style={styles.image} />}
      <View style={styles.actions}>
        <Skeleton width={56} height={20} radius={10} />
        <Skeleton width={56} height={20} radius={10} />
        <Skeleton width={56} height={20} radius={10} />
      </View>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerText: {
      marginLeft: spacing.md,
      flex: 1,
    },
    gap6: { marginTop: 6 },
    line: { marginTop: 8 },
    image: { marginTop: spacing.md },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      paddingTop: spacing.sm,
    },
  });

export default SkeletonPostCard;
