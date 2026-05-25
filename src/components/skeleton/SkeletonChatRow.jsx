import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonChatRow = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Skeleton.Circle size={48} />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Skeleton width={120} height={14} />
          <Skeleton width={32} height={10} />
        </View>
        <Skeleton width="80%" height={12} style={styles.gap8} />
      </View>
    </View>
  );
};

const SkeletonChatList = ({ count = 6 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonChatRow key={i} />
    ))}
  </View>
);

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    body: { flex: 1, marginLeft: spacing.md },
    topLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    gap8: { marginTop: 8 },
  });

SkeletonChatRow.List = SkeletonChatList;
export default SkeletonChatRow;
