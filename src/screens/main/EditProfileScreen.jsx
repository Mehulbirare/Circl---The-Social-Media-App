import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Avatar from '../../components/common/Avatar';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const EditProfileScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [fullName, setFullName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);

  const handlePickImage = () => {
    Alert.alert('Profile photo', 'Choose a source', [
      {
        text: 'Take photo',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.8 }, handlePickResult),
      },
      {
        text: 'Choose from library',
        onPress: () =>
          launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
            handlePickResult,
          ),
      },
      avatarUri && {
        text: 'Remove photo',
        style: 'destructive',
        onPress: () => setAvatarUri(null),
      },
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean));
  };

  const handlePickResult = (result) => {
    if (result?.didCancel) return;
    if (result?.errorCode) {
      Alert.alert('Could not pick image', result.errorMessage || result.errorCode);
      return;
    }
    const uri = result?.assets?.[0]?.uri;
    if (uri) setAvatarUri(uri);
  };

  const handleSave = () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    updateUser({
      name: trimmedName,
      dob: dob ? dob.toISOString() : null,
      gender,
      mobile: mobile.trim(),
      email: email.trim(),
      avatar: avatarUri,
    });
    navigation.goBack();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event?.type === 'dismissed') return;
    if (selectedDate) setDob(selectedDate);
  };

  const formatDob = (d) =>
    d
      ? d.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View>
            <Avatar name={fullName || '?'} size={96} uri={avatarUri} />
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickImage}
              activeOpacity={0.85}
            >
              <Icon name="camera" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Basic Detail</Text>

        <Field
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your name"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.input,
                styles.inputText,
                !dob && { color: colors.textSecondary },
              ]}
            >
              {dob ? formatDob(dob) : 'Select date'}
            </Text>
            <Icon
              name="chevron-down"
              size={18}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          <GenderOption
            label="Male"
            selected={gender === 'male'}
            onPress={() => setGender('male')}
          />
          <View style={{ width: spacing.md }} />
          <GenderOption
            label="Female"
            selected={gender === 'female'}
            onPress={() => setGender('female')}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
          Contact Detail
        </Text>

        <Field
          label="Mobile number"
          value={mobile}
          onChangeText={setMobile}
          placeholder="+1 555 000 0000"
          keyboardType="phone-pad"
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ScrollView>

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const Field = ({ label, rightIcon, ...inputProps }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrap}>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textSecondary}
        {...inputProps}
      />
      {rightIcon && (
        <Icon
          name={rightIcon}
          size={18}
          color={colors.textSecondary}
          style={styles.inputIcon}
        />
      )}
    </View>
  </View>
);

const GenderOption = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.genderOption, selected && styles.genderOptionSelected]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
    <Text style={styles.genderLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    borderWidth: 3,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  inputText: {
    paddingVertical: spacing.md + 4,
  },
  inputIcon: {
    marginLeft: spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  genderOptionSelected: {
    borderColor: colors.primary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  genderLabel: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
});

export default EditProfileScreen;
