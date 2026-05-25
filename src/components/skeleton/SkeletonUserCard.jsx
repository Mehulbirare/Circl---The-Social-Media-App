import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonUserCard = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <Skeleton.Circle size={48} />
      <View style={styles.info}>
        <Skeleton width={130} height={14} />
        <Skeleton width={90} height={10} style={styles.gap6} />
      </View>
      <Skeleton width={86} height={32} radius={24} />
    </View>
  );
};

const SkeletonUserList = ({ count = 4 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonUserCard key={i} />
    ))}
  </View>
);

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    info: { flex: 1, marginLeft: spacing.md },
    gap6: { marginTop: 6 },
  });

SkeletonUserCard.List = SkeletonUserList;
export default SkeletonUserCard;
