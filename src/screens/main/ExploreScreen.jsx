import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const TOPICS = ['#Food', '#Events', '#Help', '#Sports', '#News'];

const NEARBY = [
  { id: '1', name: 'Diya Bhatt', distance: '0.6 km away' },
  { id: '2', name: 'Vivaan Shah', distance: '1.1 km away' },
  { id: '3', name: 'Sneha Iyer', distance: '2.3 km away' },
  { id: '4', name: 'Arjun Kapoor', distance: '3.7 km away' },
];

const ExploreScreen = () => {
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState({});

  const toggleFollow = (id) =>
    setFollowing((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search people, topics, places"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Trending near you</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={styles.pill}
              activeOpacity={0.8}
            >
              <Text style={styles.pillText}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
          People nearby
        </Text>
        {NEARBY.map((user) => {
          const isFollowing = !!following[user.id];
          return (
            <View key={user.id} style={styles.userCard}>
              <Avatar name={user.name} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userDist}>{user.distance}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  isFollowing && styles.followingBtn,
                ]}
                onPress={() => toggleFollow(user.id)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.followText,
                    isFollowing && styles.followingText,
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  search: {
    flex: 1,
    height: 44,
    marginLeft: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionTitleSpaced: {
    marginTop: spacing.xl,
  },
  pillsRow: {
    paddingRight: spacing.lg,
  },
  pill: {
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  pillText: {
    color: colors.primary,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  userDist: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followText: {
    color: '#FFFFFF',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  followingText: {
    color: colors.primary,
  },
});

export default ExploreScreen;
