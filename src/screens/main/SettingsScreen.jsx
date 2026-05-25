import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const APP_VERSION = '1.0.0';

const SettingsScreen = ({ navigation }) => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Account">
          <NavRow
            icon="account-edit-outline"
            tint="#1D9E75"
            label="Edit profile"
            sublabel={user?.name || 'Update your details'}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <Divider />
          <NavRow
            icon="lock-outline"
            tint="#3B82F6"
            label="Change password"
            onPress={() =>
              Alert.alert('Change password', 'This is a placeholder action.')
            }
          />
          <Divider />
          <NavRow
            icon="email-outline"
            tint="#8B5CF6"
            label="Email & phone"
            sublabel={user?.email || 'Not set'}
            onPress={() =>
              Alert.alert('Email & phone', 'This is a placeholder action.')
            }
          />
        </Section>

        <Section title="Preferences">
          <ToggleRow
            icon="bell-outline"
            tint="#F59E0B"
            label="Push notifications"
            sublabel="Likes, comments and mentions"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <Divider />
          <ToggleRow
            icon="email-fast-outline"
            tint="#10B981"
            label="Email updates"
            sublabel="Weekly digest and announcements"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
          />
          <Divider />
          <ToggleRow
            icon="theme-light-dark"
            tint="#6366F1"
            label="Dark mode"
            sublabel="Coming soon"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </Section>

        <Section title="Privacy">
          <ToggleRow
            icon="shield-lock-outline"
            tint="#EF4444"
            label="Private account"
            sublabel="Only approved followers can see your posts"
            value={privateAccount}
            onValueChange={setPrivateAccount}
          />
          <Divider />
          <ToggleRow
            icon="eye-outline"
            tint="#0EA5E9"
            label="Show activity status"
            value={showActivity}
            onValueChange={setShowActivity}
          />
          <Divider />
          <NavRow
            icon="account-cancel-outline"
            tint="#6B7280"
            label="Blocked accounts"
            onPress={() =>
              Alert.alert('Blocked accounts', 'No blocked accounts yet.')
            }
          />
        </Section>

        <Section title="Support">
          <NavRow
            icon="help-circle-outline"
            tint="#8B5CF6"
            label="Help center"
            onPress={() =>
              Alert.alert('Help center', 'This is a placeholder action.')
            }
          />
          <Divider />
          <NavRow
            icon="bug-outline"
            tint="#F97316"
            label="Report a problem"
            onPress={() =>
              Alert.alert('Report a problem', 'This is a placeholder action.')
            }
          />
          <Divider />
          <NavRow
            icon="file-document-outline"
            tint="#3B82F6"
            label="Terms of service"
            onPress={() =>
              Alert.alert('Terms of service', 'This is a placeholder action.')
            }
          />
          <Divider />
          <NavRow
            icon="shield-check-outline"
            tint="#1D9E75"
            label="Privacy policy"
            onPress={() =>
              Alert.alert('Privacy policy', 'This is a placeholder action.')
            }
          />
        </Section>

        <Section title="About">
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
        </Section>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Icon name="logout" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const NavRow = ({ icon, tint, label, sublabel, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.rowIcon, { backgroundColor: tint + '1A' }]}>
      <Icon name={icon} size={18} color={tint} />
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.rowLabel}>{label}</Text>
      {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
    </View>
    <Icon name="chevron-right" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const ToggleRow = ({ icon, tint, label, sublabel, value, onValueChange }) => (
  <View style={styles.row}>
    <View style={[styles.rowIcon, { backgroundColor: tint + '1A' }]}>
      <Icon name={icon} size={18} color={tint} />
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.rowLabel}>{label}</Text>
      {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor="#FFFFFF"
    />
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  rowSublabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  aboutLabel: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  aboutValue: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
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

export default SettingsScreen;
