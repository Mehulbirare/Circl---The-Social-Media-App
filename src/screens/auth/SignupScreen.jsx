import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  requestLocationPermission,
  getCurrentPosition,
} from '../../utils/permissions';
import { signUp } from '../../services/authService';
import { updateProfile } from '../../services/profileService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SOCIAL_PROVIDERS = [
  { name: 'google', color: '#DB4437' },
  { name: 'apple', color: '#1A1A2E' },
  { name: 'facebook', color: '#1877F2' },
];

const SignupScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const coordsRef = useRef(null);

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      if (granted) {
        coordsRef.current = await getCurrentPosition();
      }
    })();
  }, []);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing info', 'Please fill in your name, email, and password.');
      return;
    }
    try {
      setLoading(true);
      await signUp({ fullName: name.trim(), email: email.trim(), password });
      if (coordsRef.current) {
        await updateProfile({
          lat: coordsRef.current.lat,
          lng: coordsRef.current.lng,
        });
      }
    } catch (e) {
      Alert.alert('Sign up failed', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
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

          <Text style={styles.title}>Join your Circl</Text>
          <Text style={styles.subtitle}>
            Connect with people in your city.
          </Text>

          <View style={styles.card}>
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              leftIcon="account-outline"
            />
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

            <Button
              label="Create account"
              onPress={handleSignup}
              loading={loading}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
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
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
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
      marginTop: spacing.lg,
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
      marginTop: spacing.md,
    },
    subtitle: {
      fontSize: typography.size.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
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

export default SignupScreen;
