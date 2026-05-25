import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SOCIAL_PROVIDERS = [
  { name: 'google', color: '#DB4437' },
  { name: 'apple', color: '#1A1A2E' },
  { name: 'facebook', color: '#1877F2' },
];

const LoginScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleLogin = () => {
    login({ name: 'Aarav', email: email || 'aarav@circl.app' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.illustration}>
            <View style={styles.logoBadge}>
              <View style={styles.logoCircle} />
            </View>
          </View>

          <Text style={styles.title}>Welcome to Circl</Text>
          <Text style={styles.subtitle}>
            Log in to see what&apos;s happening near you.
          </Text>

          <View style={styles.card}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              leftIcon="email-outline"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              leftIcon="lock-outline"
            />

            <TouchableOpacity style={styles.forgot} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button label="Log in" onPress={handleLogin} />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              {SOCIAL_PROVIDERS.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  style={styles.socialBtn}
                  activeOpacity={0.7}
                >
                  <Icon name={p.name} size={22} color={p.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Circl? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      marginTop: spacing.sm,
    },
    illustration: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    logoBadge: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 5,
      borderColor: colors.primary,
    },
    title: {
      fontSize: typography.size.xxl,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
    subtitle: {
      fontSize: typography.size.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: spacing.xl,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    forgot: {
      alignSelf: 'flex-end',
      marginBottom: spacing.lg,
      marginTop: -spacing.xs,
    },
    forgotText: {
      color: colors.primary,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: colors.textSecondary,
      fontSize: typography.size.sm,
    },
    socialRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginHorizontal: -spacing.xs,
    },
    socialBtn: {
      width: 52,
      height: 52,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      margin: spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    footerText: {
      fontSize: typography.size.md,
      color: colors.textSecondary,
    },
    footerLink: {
      fontSize: typography.size.md,
      color: colors.primary,
      fontWeight: typography.weight.bold,
    },
  });

export default LoginScreen;
