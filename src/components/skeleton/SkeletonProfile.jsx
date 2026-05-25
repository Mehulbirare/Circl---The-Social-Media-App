import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Skeleton from './Skeleton';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

const SkeletonProfile = () => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0E7A57', '#1D9E75', '#34C896']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBody}>
          <Skeleton.Circle size={104} style={styles.heroAvatar} />
          <Skeleton width={160} height={22} radius={6} style={styles.heroName} />
          <Skeleton width={120} height={20} radius={999} style={styles.heroPill} />
          <Skeleton width={240} height={12} style={styles.heroBio} />
          <Skeleton width={200} height={12} style={styles.heroBio} />
        </View>
      </LinearGradient>

      <View style={styles.statsWrap}>
        <View style={styles.statsCard}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.stat}>
              <Skeleton width={36} height={20} />
              <Skeleton width={60} height={10} style={styles.gap6} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <Skeleton width="100%" height={48} radius={14} />
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="48.5%" height={120} radius={18} style={styles.gridItem} />
          ))}
        </View>
        <Skeleton width="100%" height={56} radius={16} style={styles.gap16} />
        <Skeleton width="100%" height={56} radius={16} style={styles.gap8} />
        <Skeleton width="100%" height={56} radius={16} style={styles.gap8} />
      </View>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      paddingTop: spacing.huge,
      paddingBottom: spacing.huge + spacing.xl,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      paddingHorizontal: spacing.xl,
    },
    heroBody: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    heroAvatar: { backgroundColor: 'rgba(255,255,255,0.35)' },
    heroName: { marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.35)' },
    heroPill: { marginTop: spacing.sm, backgroundColor: 'rgba(255,255,255,0.35)' },
    heroBio: { marginTop: spacing.sm, backgroundColor: 'rgba(255,255,255,0.3)' },
    statsWrap: {
      marginTop: -spacing.xl - spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: spacing.lg,
      justifyContent: 'space-around',
    },
    stat: { alignItems: 'center' },
    gap6: { marginTop: 6 },
    gap8: { marginTop: 8 },
    gap16: { marginTop: 16 },
    body: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
    },
    gridItem: { marginBottom: spacing.md },
  });

export default SkeletonProfile;
