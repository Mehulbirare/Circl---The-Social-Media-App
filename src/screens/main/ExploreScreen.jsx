import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import SkeletonExplore from '../../components/skeleton/SkeletonExplore';
import {
  getAllUsers,
  searchUsers,
  follow,
  unfollow,
} from '../../services/usersService';
import { supabase } from '../../lib/supabase';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const TOPICS = ['#Food', '#Events', '#Help', '#Sports', '#News'];

const ExploreScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [followingSet, setFollowingSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [all, follows] = await Promise.all([
          getAllUsers(),
          loadCurrentFollows(),
        ]);
        if (!active) return;
        setUsers(all || []);
        setFollowingSet(new Set(follows));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return undefined;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const rows = await searchUsers(q);
        setSearchResults(rows || []);
      } catch (_) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const toggleFollow = async (userId) => {
    const isFollowing = followingSet.has(userId);
    const next = new Set(followingSet);
    if (isFollowing) next.delete(userId);
    else next.add(userId);
    setFollowingSet(next);
    try {
      if (isFollowing) await unfollow(userId);
      else await follow(userId);
    } catch (err) {
      const revert = new Set(next);
      if (isFollowing) revert.add(userId);
      else revert.delete(userId);
      setFollowingSet(revert);
      Alert.alert('Could not update follow', err.message || 'Please try again.');
    }
  };

  const visible = useMemo(() => {
    const source = searchResults == null ? users : searchResults;
    return source.map((u) => ({
      id: u.id,
      name: u.full_name,
      avatar: u.avatar_url,
      subtitle: u.city || '',
    }));
  }, [users, searchResults]);

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
          autoCapitalize="none"
        />
      </View>
      {loading ? (
        <SkeletonExplore />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {searchResults == null && (
            <>
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
            </>
          )}

          <Text
            style={[
              styles.sectionTitle,
              searchResults == null && styles.sectionTitleSpaced,
            ]}
          >
            {searchResults == null ? 'All people' : 'Search results'}
          </Text>
          {visible.length === 0 ? (
            <Text style={styles.empty}>
              {searchResults == null
                ? 'No people yet.'
                : 'No matches.'}
            </Text>
          ) : (
            visible.map((u) => {
              const isFollowing = followingSet.has(u.id);
              return (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('UserProfile', {
                      userId: u.id,
                      name: u.name,
                      avatar: u.avatar,
                    })
                  }
                >
                  <Avatar name={u.name} uri={u.avatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.name}</Text>
                    {u.subtitle ? (
                      <Text style={styles.userDist}>{u.subtitle}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.followBtn,
                      isFollowing && styles.followingBtn,
                    ]}
                    onPress={() => toggleFollow(u.id)}
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
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

async function loadCurrentFollows() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);
  return (data || []).map((r) => r.following_id);
}

const makeStyles = (colors) =>
  StyleSheet.create({
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
    empty: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      paddingVertical: spacing.md,
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
