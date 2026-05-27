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
  PermissionsAndroid,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';
import Button from '../../components/common/Button';
import { usePostStore } from '../../store/usePostStore';
import { useLocationStore } from '../../store/useLocationStore';
import { createPost } from '../../services/postsService';
import { uploadPostMedia } from '../../services/imageService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MAX_POST_LENGTH } from '../../constants/config';

const MAX_VIDEO_SECONDS = 60;

const ensureAndroidMediaPermission = async (kind) => {
  if (Platform.OS !== 'android') return true;
  const sdk = Platform.Version;
  // API 33+ uses granular READ_MEDIA_* permissions. Older versions use READ_EXTERNAL_STORAGE.
  if (sdk >= 33) {
    const perm =
      kind === 'video'
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
        : PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    const result = await PermissionsAndroid.request(perm);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const ensureAndroidCameraPermission = async (forVideo) => {
  if (Platform.OS !== 'android') return true;
  const camera = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  if (camera !== PermissionsAndroid.RESULTS.GRANTED) return false;
  if (forVideo) {
    const mic = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (mic !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }
  return true;
};

const CreatePostScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null); // { uri, type: 'image' | 'video' }
  const [submitting, setSubmitting] = useState(false);
  const bumpRefresh = usePostStore((s) => s.bumpRefresh);
  const coords = useLocationStore((s) => s.coords);

  const handleChange = (value) => {
    if (value.length <= MAX_POST_LENGTH) setText(value);
  };

  const applyAsset = (asset) => {
    if (!asset?.uri) return;
    const isVideo =
      (asset.type && asset.type.startsWith('video')) ||
      /\.(mp4|mov|m4v|webm|3gp)$/i.test(asset.uri);
    setMedia({ uri: asset.uri, type: isVideo ? 'video' : 'image' });
  };

  const pickFromLibrary = async (mediaType) => {
    const ok = await ensureAndroidMediaPermission(mediaType);
    if (!ok) {
      Alert.alert(
        'Permission needed',
        'Allow Circl to access your photos and videos to attach media.',
      );
      return;
    }
    const res = await launchImageLibrary({
      mediaType,
      quality: 0.8,
      selectionLimit: 1,
      videoQuality: 'medium',
      includeBase64: false,
    });
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Could not open library', res.errorMessage || res.errorCode);
      return;
    }
    applyAsset(res.assets && res.assets[0]);
  };

  const captureWithCamera = async (mediaType) => {
    const ok = await ensureAndroidCameraPermission(mediaType === 'video');
    if (!ok) {
      Alert.alert(
        'Permission needed',
        'Allow Circl to use your camera to capture media.',
      );
      return;
    }
    const res = await launchCamera({
      mediaType,
      quality: 0.8,
      videoQuality: 'medium',
      durationLimit: MAX_VIDEO_SECONDS,
      saveToPhotos: true,
    });
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Could not open camera', res.errorMessage || res.errorCode);
      return;
    }
    applyAsset(res.assets && res.assets[0]);
  };

  const handleAttach = () => {
    const options = [
      'Choose photo from library',
      'Choose video from library',
      'Take photo',
      'Record video',
      'Cancel',
    ];
    const actions = [
      () => pickFromLibrary('photo'),
      () => pickFromLibrary('video'),
      () => captureWithCamera('photo'),
      () => captureWithCamera('video'),
    ];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 4 },
        (index) => {
          if (index < actions.length) actions[index]();
        },
      );
      return;
    }
    Alert.alert('Add media', undefined, [
      { text: options[0], onPress: actions[0] },
      { text: options[1], onPress: actions[1] },
      { text: options[2], onPress: actions[2] },
      { text: options[3], onPress: actions[3] },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePost = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      let imageUrl;
      if (media?.uri) {
        imageUrl = await uploadPostMedia(media.uri, media.type);
      }
      await createPost({
        text: text.trim(),
        imageUrl,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setText('');
      setMedia(null);
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
        {media ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: media.uri }} style={styles.preview} />
            {media.type === 'video' ? (
              <View style={styles.videoOverlay} pointerEvents="none">
                <Icon name="play-circle" size={56} color="#FFFFFF" />
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.removeBtn}
              activeOpacity={0.7}
              onPress={() => setMedia(null)}
            >
              <Icon name="close" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={handleAttach}
          >
            <Icon name="image-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => captureWithCamera('video')}
          >
            <Icon name="video-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Icon
              name="map-marker-outline"
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
      backgroundColor: colors.primaryLight,
    },
    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
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
