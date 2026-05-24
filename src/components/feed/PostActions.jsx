import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const PostActions = ({ post, onLike }) => {
  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likes ?? 0);

  const handleLike = () => {
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    setLiked((prev) => !prev);
    if (onLike) onLike(post.id);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.item}
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <Icon
          name={liked ? 'heart' : 'heart-outline'}
          size={22}
          color={liked ? colors.danger : colors.textSecondary}
        />
        <Text style={[styles.count, liked && styles.countActive]}>{likes}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} activeOpacity={0.7}>
        <Icon
          name="comment-outline"
          size={22}
          color={colors.textSecondary}
        />
        <Text style={styles.count}>{post.comments ?? 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} activeOpacity={0.7}>
        <Icon name="share-outline" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xxl,
  },
  count: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: typography.weight.medium,
  },
  countActive: {
    color: colors.danger,
  },
});

export default PostActions;
