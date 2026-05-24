import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../components/common/Button';
import { usePostStore } from '../../store/usePostStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MAX_POST_LENGTH } from '../../constants/config';

const CreatePostScreen = ({ navigation }) => {
  const [text, setText] = useState('');
  const addPost = usePostStore((s) => s.addPost);

  const handleChange = (value) => {
    if (value.length <= MAX_POST_LENGTH) setText(value);
  };

  const handlePost = () => {
    if (!text.trim()) return;
    addPost({
      id: String(Date.now()),
      author: 'You',
      time: 'just now',
      distance: '0 km away',
      text: text.trim(),
      likes: 0,
      comments: 0,
    });
    setText('');
    if (navigation && navigation.navigate) {
      navigation.navigate('Home');
    }
  };

  const counterColor =
    text.length > MAX_POST_LENGTH - 30
      ? colors.warning
      : colors.textSecondary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>New post</Text>
        </View>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          placeholder="What's happening near you?"
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Icon name="image-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Icon
              name="map-marker-outline"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Icon
              name="emoticon-happy-outline"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
          <View style={styles.spacer} />
          <Text style={[styles.counter, { color: counterColor }]}>
            {text.length}/{MAX_POST_LENGTH}
          </Text>
        </View>
        <View style={styles.footer}>
          <Button
            label="Post to Circl"
            onPress={handlePost}
            disabled={!text.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  spacer: { flex: 1 },
  counter: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

export default CreatePostScreen;
