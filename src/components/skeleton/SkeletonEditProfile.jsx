import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const Field = ({ labelWidth = 80 }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Skeleton width={labelWidth} height={12} />
      <Skeleton width="100%" height={48} radius={12} style={styles.gap8} />
    </View>
  );
};

const SkeletonEditProfile = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.avatarRow}>
        <Skeleton.Circle size={96} />
        <Skeleton width={120} height={14} style={styles.gap12} />
      </View>
      <Field labelWidth={90} />
      <Field labelWidth={60} />
      <Field labelWidth={70} />
      <Field labelWidth={80} />
      <Field labelWidth={120} />
      <Skeleton width="100%" height={48} radius={12} style={styles.button} />
    </View>
  );
};

const makeStyles = () =>
  StyleSheet.create({
    wrap: { padding: spacing.lg },
    avatarRow: { alignItems: 'center', marginBottom: spacing.xl },
    gap8: { marginTop: 8 },
    gap12: { marginTop: 12 },
    field: { marginBottom: spacing.md },
    button: { marginTop: spacing.xl },
  });

export default SkeletonEditProfile;
