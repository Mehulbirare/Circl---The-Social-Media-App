import React from 'react';
import { FlatList, RefreshControl, View, Text, StyleSheet } from 'react-native';
import PostCard from './PostCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const FeedList = ({ posts, onRefresh, refreshing, onPressPost }) => (
  <FlatList
    data={posts}
    keyExtractor={(item) => String(item.id)}
    renderItem={({ item }) => (
      <PostCard
        post={item}
        onPress={() => onPressPost && onPressPost(item)}
      />
    )}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl
        refreshing={!!refreshing}
        onRefresh={onRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
      />
    }
    ListEmptyComponent={
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your circle is quiet</Text>
        <Text style={styles.emptyText}>
          Be the first to share something happening nearby.
        </Text>
      </View>
    }
  />
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
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
