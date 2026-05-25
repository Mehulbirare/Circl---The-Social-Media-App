import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '../common/Avatar';
import PostActions from './PostActions';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const PostCard = ({ post, onPress, onLike }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Avatar name={post.author} />
        <View style={styles.headerText}>
          <View style={styles.row}>
            <Text style={styles.name}>{post.author}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{post.distance}</Text>
            </View>
          </View>
          <Text style={styles.time}>{post.time}</Text>
        </View>
      </View>
      <Text style={styles.body}>{post.text}</Text>
      {post.image ? <View style={styles.imagePlaceholder} /> : null}
      <PostActions post={post} onLike={onLike} />
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
    imagePlaceholder: {
      height: 180,
      backgroundColor: colors.primaryLight,
      borderRadius: 12,
      marginBottom: spacing.md,
    },
  });

export default PostCard;
