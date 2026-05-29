import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import PostActions from '../../components/feed/PostActions';
import SkeletonPostDetail from '../../components/skeleton/SkeletonPostDetail';
import {
  getPost,
  getComments,
  hasLiked,
  toggleLike,
  addComment,
  deletePost,
} from '../../services/postsService';
import { thumbnailUrlForVideoUrl } from '../../services/imageService';
import { usePostStore } from '../../store/usePostStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const formatRelative = (iso) => {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
};

const PostDetailScreen = ({ route, navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const initialPost = route?.params?.post || {};
  const postId = initialPost.id;

  const user = useAuthStore((s) => s.user);
  const bumpRefresh = usePostStore((s) => s.bumpRefresh);
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const setPostComments = usePostStore((s) => s.setPostComments);

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deletePost(postId);
              bumpRefresh();
              navigation.goBack();
            } catch (err) {
              Alert.alert('Could not delete post', err.message || 'Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    if (!postId) return undefined;
    let active = true;
    (async () => {
      try {
        const [fresh, list, isLiked] = await Promise.all([
          getPost(postId),
          getComments(postId),
          hasLiked(postId),
        ]);
        if (!active) return;
        setPost((prev) => ({
          ...prev,
          ...fresh,
          author: fresh.author?.full_name || prev.author,
          authorAvatar: fresh.author?.avatar_url || prev.authorAvatar,
          imageUrl: fresh.image_url || prev.imageUrl,
          liked: isLiked,
          likes: prev.likes ?? 0,
        }));
        setComments(list || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [postId]);

  // Reflect the authoritative comment count back onto the feed card once
  // comments have loaded and after each new comment is posted.
  useEffect(() => {
    if (loading || !postId) return;
    setPostComments(postId, comments.length);
  }, [comments.length, loading, postId, setPostComments]);

  const handleOpenAuthor = () => {
    if (!post.author_id) return;
    navigation.navigate('UserProfile', {
      userId: post.author_id,
      name: post.author,
      avatar: post.authorAvatar,
    });
  };

  const handleLike = async () => {
    try {
      await toggleLike(postId);
    } catch (err) {
      Alert.alert('Could not update like', err.message || 'Please try again.');
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const c = await addComment(postId, text);
      setComments((prev) => [c, ...prev]);
      setDraft('');
    } catch (err) {
      Alert.alert('Could not post comment', err.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const postForActions = { ...post, comments: comments.length };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {user?.id === post.author_id ? (
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={styles.rightBtn}
          >
            <Icon name="trash-can-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>
      {deleting ? (
        <SafeAreaView style={[styles.container, styles.center]} edges={['bottom']}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.deletingText}>Deleting post...</Text>
        </SafeAreaView>
      ) : loading ? (
        <SkeletonPostDetail />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={handleOpenAuthor}
              disabled={!post.author_id}
            >
              <Avatar name={post.author} uri={post.authorAvatar} />
              <View style={styles.headerText}>
                <Text style={styles.name}>{post.author}</Text>
                <Text style={styles.meta}>
                  {post.distance ? `${post.distance} • ` : ''}
                  {post.time || formatRelative(post.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.body}>{post.text}</Text>
            {post.imageUrl ? (
              <View style={styles.mediaWrap}>
                {/\.(mp4|mov|m4v|webm|3gp)(\?|$)/i.test(post.imageUrl) ? (
                  <View style={styles.videoBox}>
                    {!thumbFailed ? (
                      <Image
                        source={{ uri: thumbnailUrlForVideoUrl(post.imageUrl) }}
                        style={styles.media}
                        onError={() => setThumbFailed(true)}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.videoOverlay} pointerEvents="none">
                      <Icon name="play-circle" size={64} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.media}
                    resizeMode="cover"
                  />
                )}
              </View>
            ) : null}
            <PostActions post={postForActions} onLike={handleLike} />
            <Text style={styles.commentsTitle}>Comments</Text>
            {comments.length === 0 ? (
              <Text style={styles.empty}>Be the first to comment.</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.comment}>
                  <Avatar
                    name={c.author?.full_name || 'User'}
                    size={36}
                    uri={c.author?.avatar_url}
                  />
                  <View style={styles.commentBody}>
                    <Text style={styles.commentAuthor}>
                      {c.author?.full_name || 'User'}
                    </Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                    <Text style={styles.commentTime}>
                      {formatRelative(c.created_at)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a comment"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!draft.trim() || sending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!draft.trim() || sending}
            >
              <Icon name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    backBtn: {
      width: 24,
    },
    headerTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    scroll: {
      padding: spacing.lg,
      paddingBottom: spacing.huge,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerText: {
      marginLeft: spacing.md,
    },
    name: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    meta: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    body: {
      fontSize: typography.size.lg,
      color: colors.textPrimary,
      lineHeight: 26,
      marginBottom: spacing.lg,
    },
    mediaWrap: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    media: {
      width: '100%',
      height: 260,
      backgroundColor: colors.primaryLight,
    },
    videoBox: {
      width: '100%',
      height: 260,
      backgroundColor: '#000',
      position: 'relative',
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
    commentsTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    empty: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      paddingVertical: spacing.md,
    },
    comment: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    commentBody: {
      flex: 1,
      marginLeft: spacing.md,
    },
    commentAuthor: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    commentText: {
      fontSize: typography.size.md,
      color: colors.textPrimary,
      marginTop: 2,
      lineHeight: 20,
    },
    commentTime: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.textPrimary,
      fontSize: typography.size.md,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
    rightBtn: {
      width: 24,
      alignItems: 'flex-end',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    deletingText: {
      color: colors.textSecondary,
      fontSize: typography.size.md,
      marginTop: spacing.md,
      fontWeight: typography.weight.medium,
    },
  });

export default PostDetailScreen;
