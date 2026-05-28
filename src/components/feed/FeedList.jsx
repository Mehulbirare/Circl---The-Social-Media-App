import React from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import PostCard from './PostCard';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const FeedList = ({
  posts,
  onRefresh,
  refreshing,
  onPressPost,
  onComment,
  onEndReached,
  loadingMore,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() => onPressPost && onPressPost(item)}
          onComment={onComment ? () => onComment(item) : undefined}
        />
      )}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={!!refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyText}>
            Be the first to share something with everyone.
          </Text>
        </View>
      }
    />
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.huge,
    },
    footer: {
      paddingVertical: spacing.lg,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.huge,
    },
    emptyTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    emptyText: {
      fontSize: typography.size.md,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

export default FeedList;
