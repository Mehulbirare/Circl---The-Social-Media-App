import React, { useRef, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import Button from '../../components/common/Button';
import { usePostStore } from '../../store/usePostStore';
import { useLocationStore } from '../../store/useLocationStore';
import { createPost } from '../../services/postsService';
import {
  uploadPostMedia,
  uploadThumbnailForVideo,
} from '../../services/imageService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MAX_POST_LENGTH } from '../../constants/config';

const MAX_VIDEO_SECONDS = 60;
const MAX_MEDIA_BYTES = 50 * 1024 * 1024; // 50 MB

const ensureAndroidMediaPermission = async (kind) => {
  if (Platform.OS !== 'android') return true;
  const sdk = Platform.Version;
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

const formatBytes = (n) => {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const CreatePostScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null); // { uri, type, previewUri, thumbUri, size }
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bytesSent, setBytesSent] = useState(0);
  const [bytesTotal, setBytesTotal] = useState(0);
  const abortRef = useRef(null);
  const bumpRefresh = usePostStore((s) => s.bumpRefresh);
  const coords = useLocationStore((s) => s.coords);

  const handleChange = (value) => {
    if (value.length <= MAX_POST_LENGTH) setText(value);
  };

  const applyAsset = async (asset) => {
    if (!asset?.uri) return;
    const isVideo =
      (asset.type && asset.type.startsWith('video')) ||
      /\.(mp4|mov|m4v|webm|3gp)$/i.test(asset.uri);

    if (asset.fileSize && asset.fileSize > MAX_MEDIA_BYTES) {
      Alert.alert(
        'File too large',
        `That file is ${formatBytes(asset.fileSize)}. Please choose something under ${formatBytes(MAX_MEDIA_BYTES)}.`,
      );
      return;
    }

    if (!isVideo) {
      setMedia({
        uri: asset.uri,
        type: 'image',
        previewUri: asset.uri,
        size: asset.fileSize,
      });
      return;
    }

    let thumbUri = null;
    try {
      const thumb = await createThumbnail({
        url: asset.uri,
        timeStamp: 1000,
        format: 'jpeg',
      });
      thumbUri = thumb?.path
        ? thumb.path.startsWith('/')
          ? `file://${thumb.path}`
          : thumb.path
        : null;
    } catch (e) {
      // Non-fatal: we'll fall back to a play-icon placeholder.
    }
    setMedia({
      uri: asset.uri,
      type: 'video',
      previewUri: thumbUri,
      thumbUri,
      size: asset.fileSize,
    });
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
    await applyAsset(res.assets && res.assets[0]);
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
    await applyAsset(res.assets && res.assets[0]);
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

  const handleCancelUpload = () => {
    if (abortRef.current) abortRef.current.abort();
  };

  const handlePost = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setProgress(0);
    setBytesSent(0);
    setBytesTotal(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let imageUrl;
      if (media?.uri) {
        const uploaded = await uploadPostMedia(media.uri, media.type, {
          signal: controller.signal,
          onProgress: (ratio, loaded, total) => {
            setProgress(ratio);
            setBytesSent(loaded);
            setBytesTotal(total);
          },
        });
        imageUrl = uploaded.url;

        if (media.type === 'video' && media.thumbUri) {
          try {
            await uploadThumbnailForVideo(media.thumbUri, uploaded.path);
          } catch (e) {
            // Non-fatal: the post can still display via the play-icon placeholder.
          }
        }
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
      if (err?.code === 'ABORTED') {
        // Cancelled by the user — silent.
      } else {
        Alert.alert('Could not post', err.message || 'Please try again.');
      }
    } finally {
      abortRef.current = null;
      setSubmitting(false);
      setProgress(0);
      setBytesSent(0);
      setBytesTotal(0);
    }
  };

  const counterColor =
    text.length > MAX_POST_LENGTH - 30
      ? colors.warning
      : colors.textSecondary;

  const progressPct = Math.round(progress * 100);
  const showProgress = submitting && !!media;

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
          editable={!submitting}
        />
        {media ? (
          <View style={styles.previewWrap}>
            {media.previewUri ? (
              <Image source={{ uri: media.previewUri }} style={styles.preview} />
            ) : (
              <View style={[styles.preview, styles.previewFallback]} />
            )}
            {media.type === 'video' ? (
              <View style={styles.videoOverlay} pointerEvents="none">
                <Icon name="play-circle" size={56} color="#FFFFFF" />
              </View>
            ) : null}
            {!submitting ? (
              <TouchableOpacity
                style={styles.removeBtn}
                activeOpacity={0.7}
                onPress={() => setMedia(null)}
              >
                <Icon name="close" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : null}
            {showProgress ? (
              <View style={styles.progressOverlay}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.progressText}>
                  Uploading {progressPct}%
                  {bytesTotal
                    ? ` · ${formatBytes(bytesSent)} / ${formatBytes(bytesTotal)}`
                    : ''}
                </Text>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[styles.progressBarFill, { width: `${progressPct}%` }]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.8}
                  onPress={handleCancelUpload}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={handleAttach}
            disabled={submitting}
          >
            <Icon name="image-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => captureWithCamera('video')}
            disabled={submitting}
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
            label={
              submitting
                ? media
                  ? `Posting ${progressPct}%`
                  : 'Posting...'
                : 'Post to Circl'
            }
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
    previewFallback: {
      backgroundColor: '#000',
    },
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
    progressOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    progressText: {
      color: '#FFFFFF',
      marginTop: spacing.sm,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
    },
    progressBarTrack: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#FFFFFF',
    },
    cancelBtn: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    cancelText: {
      color: '#FFFFFF',
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
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
