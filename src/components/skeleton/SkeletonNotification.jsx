import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonNotificationRow = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Skeleton.Circle size={44} />
      <View style={styles.body}>
        <Skeleton width="65%" height={14} />
        <Skeleton width="25%" height={10} style={styles.timeGap} />
      </View>
    </View>
  );
};

const SkeletonNotificationList = ({ count = 8 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonNotificationRow key={i} />
    ))}
  </View>
);

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    body: {
      flex: 1,
      marginLeft: spacing.lg,
      justifyContent: 'center',
    },
    timeGap: {
      marginTop: 6,
    },
  });

SkeletonNotificationRow.List = SkeletonNotificationList;
export default SkeletonNotificationRow;
