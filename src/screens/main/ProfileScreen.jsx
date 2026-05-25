import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../../components/common/Avatar';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const ACTION_CARDS = [
  {
    key: 'posts',
    label: 'Posts',
    value: '24',
    icon: 'image-multiple',
    gradient: ['#1D9E75', '#0E7A57'],
  },
  {
    key: 'saved',
    label: 'Saved',
    value: '12',
    icon: 'bookmark',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    key: 'events',
    label: 'Events',
    value: '3',
    icon: 'calendar-star',
    gradient: ['#8B5CF6', '#6D28D9'],
  },
  {
    key: 'friends',
    label: 'Friends',
    value: '184',
    icon: 'account-group',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
];

const ProfileScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const city = useLocationStore((s) => s.city);
  const region = useLocationStore((s) => s.region);
  const name = user?.name || 'You';
  const bio =
    user?.bio || 'Building communities, one neighbourhood at a time.';
  const avatar = user?.avatar || null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#0E7A57', '#1D9E75', '#34C896']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <Text style={styles.topTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.iconBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Settings')}
              >
                <Icon name="cog-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <Avatar name={name} size={96} uri={avatar} />
                </View>
              </View>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.locPill}>
                <Icon name="map-marker" size={14} color="#FFFFFF" />
                <Text style={styles.locText}>
                  {city ? `${city}, ${region}` : 'Locating…'}
                </Text>
              </View>
              <Text style={styles.bio}>{bio}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.statsCardWrap}>
          <View style={styles.statsCard}>
            <Stat value="24" label="Posts" />
            <View style={styles.statDivider} />
            <Stat value="312" label="Followers" />
            <View style={styles.statDivider} />
            <Stat value="184" label="Following" />
          </View>
        </View>

        <View style={styles.body}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <LinearGradient
              colors={['#1D9E75', '#0E7A57']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editBtn}
            >
              <Icon name="pencil-outline" size={18} color="#FFFFFF" />
              <Text style={styles.editText}>Edit profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.grid}>
            {ACTION_CARDS.map((card) => (
              <TouchableOpacity
                key={card.key}
                style={styles.actionShadow}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={card.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCard}
                >
                  <View style={styles.actionIcon}>
                    <Icon name={card.icon} size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionValue}>{card.value}</Text>
                  <Text style={styles.actionLabel}>{card.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.menuCard}>
            <MenuRow icon="bell-outline" label="Notifications" tint="#F59E0B" />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="shield-lock-outline"
              label="Privacy"
              tint="#3B82F6"
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="help-circle-outline"
              label="Help & support"
              tint="#8B5CF6"
            />
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
            activeOpacity={0.85}
          >
            <Icon name="logout" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const Stat = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuRow = ({ icon, label, tint }) => (
  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
    <View style={[styles.menuIcon, { backgroundColor: tint + '1A' }]}>
      <Icon name={icon} size={18} color={tint} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <Icon name="chevron-right" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.huge,
  },
  hero: {
    paddingBottom: spacing.huge + spacing.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroSafe: {
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  topTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    marginTop: spacing.md,
    fontSize: 24,
    fontWeight: typography.weight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  locPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  locText: {
    color: '#FFFFFF',
    fontSize: typography.size.sm,
    marginLeft: 4,
    fontWeight: typography.weight.medium,
  },
  bio: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.size.md,
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  statsCardWrap: {
    marginTop: -spacing.xl - spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: spacing.lg,
    shadowColor: '#0E7A57',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: 14,
    shadowColor: '#1D9E75',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginLeft: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  actionShadow: {
    width: '48.5%',
    marginBottom: spacing.md,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  actionCard: {
    borderRadius: 18,
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionValue: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: typography.weight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  actionLabel: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginTop: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.danger,
    marginLeft: spacing.sm,
  },
});

export default ProfileScreen;
