import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import Button from '../../components/common/Button';
import { usePostStore } from '../../store/usePostStore';
import { useLocationStore } from '../../store/useLocationStore';
import { createPost } from '../../services/postsService';
import { uploadPostImage } from '../../services/imageService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MAX_POST_LENGTH } from '../../constants/config';

const CreatePostScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const bumpRefresh = usePostStore((s) => s.bumpRefresh);
  const coords = useLocationStore((s) => s.coords);

  const handleChange = (value) => {
    if (value.length <= MAX_POST_LENGTH) setText(value);
  };

  const handlePickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (res.didCancel) return;
    const asset = res.assets && res.assets[0];
    if (asset?.uri) setImageUri(asset.uri);
  };

  const handlePost = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      let imageUrl;
      if (imageUri) {
        imageUrl = await uploadPostImage(imageUri);
      }
      await createPost({
        text: text.trim(),
        imageUrl,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setText('');
      setImageUri(null);
      bumpRefresh();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not post', err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
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
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.removeBtn}
              activeOpacity={0.7}
              onPress={() => setImageUri(null)}
            >
              <Icon name="close" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={handlePickImage}
          >
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
            label={submitting ? 'Posting...' : 'Post to Circl'}
            onPress={handlePost}
            disabled={!text.trim() || submitting}
          />
        </View>
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
    previewWrap: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    preview: {
      width: '100%',
      height: 180,
      borderRadius: 12,
    },
    removeBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
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
