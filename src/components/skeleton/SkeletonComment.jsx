import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonComment = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Skeleton.Circle size={36} />
      <View style={styles.body}>
        <Skeleton width={100} height={12} />
        <Skeleton width="92%" height={14} style={styles.gap6} />
        <Skeleton width="70%" height={14} style={styles.gap4} />
        <Skeleton width={50} height={10} style={styles.gap6} />
      </View>
    </View>
  );
};

const SkeletonCommentList = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonComment key={i} />
    ))}
  </View>
);

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    body: { flex: 1, marginLeft: spacing.md },
    gap4: { marginTop: 4 },
    gap6: { marginTop: 6 },
  });

SkeletonComment.List = SkeletonCommentList;
export default SkeletonComment;
