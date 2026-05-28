import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../common/Avatar';
import PostActions from './PostActions';
import { thumbnailUrlForVideoUrl } from '../../services/imageService';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const isVideoUrl = (url) => /\.(mp4|mov|m4v|webm|3gp)(\?|$)/i.test(url || '');

const PostCard = ({ post, onPress, onLike, onComment }) => {
  const styles = useThemedStyles(makeStyles);
  const [thumbFailed, setThumbFailed] = useState(false);
  const mediaUrl = post.imageUrl;
  const showVideo = mediaUrl && isVideoUrl(mediaUrl);
  const thumbUrl = showVideo ? thumbnailUrlForVideoUrl(mediaUrl) : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Avatar name={post.author} uri={post.authorAvatar} />
        <View style={styles.headerText}>
          <View style={styles.row}>
            <Text style={styles.name}>{post.author}</Text>
            {post.distance ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{post.distance}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.time}>{post.time}</Text>
        </View>
      </View>
      <Text style={styles.body}>{post.text}</Text>
      {mediaUrl ? (
        <View style={styles.mediaWrap}>
          {showVideo ? (
            <View style={styles.videoBox}>
              {thumbUrl && !thumbFailed ? (
                <Image
                  source={{ uri: thumbUrl }}
                  style={styles.media}
                  onError={() => setThumbFailed(true)}
                />
              ) : null}
              <View style={styles.videoOverlay} pointerEvents="none">
                <Icon name="play-circle" size={56} color="#FFFFFF" />
              </View>
            </View>
          ) : (
            <Image source={{ uri: mediaUrl }} style={styles.media} />
          )}
        </View>
      ) : null}
      <PostActions post={post} onLike={onLike} onComment={onComment} />
    </TouchableOpacity>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerText: {
      marginLeft: spacing.md,
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    name: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    badge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 24,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginLeft: spacing.sm,
    },
    badgeText: {
      fontSize: typography.size.xs,
      color: colors.primary,
      fontWeight: typography.weight.medium,
    },
    time: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    body: {
      fontSize: typography.size.md,
      color: colors.textPrimary,
      lineHeight: 22,
      marginBottom: spacing.md,
    },
    mediaWrap: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    media: {
      width: '100%',
      height: 220,
      backgroundColor: colors.primaryLight,
    },
    videoBox: {
      width: '100%',
      height: 220,
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
  });

export default PostCard;
