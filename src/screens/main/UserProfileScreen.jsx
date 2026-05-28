import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../../components/common/Avatar';
import PostCard from '../../components/feed/PostCard';
import SkeletonProfile from '../../components/skeleton/SkeletonProfile';
import { supabase } from '../../lib/supabase';
import { getProfile, getProfileStats } from '../../services/profileService';
import { getPostsByAuthor } from '../../services/postsService';
import { isFollowing, follow, unfollow } from '../../services/usersService';
import { openChat } from '../../services/chatService';
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
  return `${Math.floor(d / 7)}w ago`;
};

const mapPost = (row) => ({
  id: row.id,
  author_id: row.author_id,
  author: row.author?.full_name || 'Someone',
  authorAvatar: row.author?.avatar_url,
  time: formatRelative(row.created_at),
  distance: '',
  text: row.text,
  image: !!row.image_url,
  imageUrl: row.image_url,
  likes: row.likes_count ?? 0,
  comments: row.comments_count ?? 0,
  lat: row.lat,
  lng: row.lng,
  created_at: row.created_at,
});

const UserProfileScreen = ({ route, navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { userId, name: nameHint, avatar: avatarHint } = route.params || {};

  const [profile, setProfile] = useState(
    nameHint ? { id: userId, full_name: nameHint, avatar_url: avatarHint } : null,
  );
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const self = user?.id === userId;
        if (active) setIsSelf(self);

        const [p, s, fp, fol] = await Promise.all([
          getProfile(userId),
          getProfileStats(userId),
          getPostsByAuthor(userId),
          self ? Promise.resolve(false) : isFollowing(userId),
        ]);
        if (!active) return;
        setProfile(p);
        setStats(s);
        setPosts((fp || []).map(mapPost));
        setFollowing(fol);
      } catch (err) {
        if (active) {
          Alert.alert('Could not load profile', err.message || 'Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleToggleFollow = async () => {
    if (busy) return;
    const next = !following;
    setBusy(true);
    setFollowing(next);
    setStats((prev) => ({
      ...prev,
      followers: Math.max(0, prev.followers + (next ? 1 : -1)),
    }));
    try {
      if (next) await follow(userId);
      else await unfollow(userId);
    } catch (err) {
      setFollowing(!next);
      setStats((prev) => ({
        ...prev,
        followers: Math.max(0, prev.followers + (next ? -1 : 1)),
      }));
      Alert.alert('Could not update follow', err.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleMessage = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const chatId = await openChat(userId);
      navigation.navigate('ChatThread', {
        chatId,
        other: {
          id: profile?.id || userId,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
        },
      });
    } catch (err) {
      Alert.alert('Could not open chat', err.message || 'Please try again.');
    } finally {
      setOpening(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SkeletonProfile />
      </View>
    );
  }

  const name = profile?.full_name || 'User';
  const bio = profile?.bio;
  const avatar = profile?.avatar_url || null;
  const city = profile?.city;
  const region = profile?.region;

  const Stat = ({ value, label, onPress }) => {
    const content = (
      <>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </>
    );
    if (!onPress) return <View style={styles.stat}>{content}</View>;
    return (
      <TouchableOpacity style={styles.stat} activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#0E7A57', '#1D9E75', '#34C896']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconBtn}
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
                hitSlop={12}
              >
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.topTitle} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.iconBtnGhost} />
            </View>

            <View style={styles.heroBody}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <Avatar name={name} size={96} uri={avatar} />
                </View>
              </View>
              <Text style={styles.name}>{name}</Text>
              {city ? (
                <View style={styles.locPill}>
                  <Icon name="map-marker" size={14} color="#FFFFFF" />
                  <Text style={styles.locText}>
                    {region ? `${city}, ${region}` : city}
                  </Text>
                </View>
              ) : null}
              {bio ? <Text style={styles.bio}>{bio}</Text> : null}
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.statsCardWrap}>
          <View style={styles.statsCard}>
            <Stat value={String(stats.posts)} label="Posts" />
            <View style={styles.statDivider} />
            <Stat
              value={String(stats.followers)}
              label="Followers"
              onPress={() =>
                navigation.push('FollowList', { userId, mode: 'followers' })
              }
            />
            <View style={styles.statDivider} />
            <Stat
              value={String(stats.following)}
              label="Following"
              onPress={() =>
                navigation.push('FollowList', { userId, mode: 'following' })
              }
            />
          </View>
        </View>

        <View style={styles.body}>
          {!isSelf ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.flex}
                activeOpacity={0.9}
                onPress={handleToggleFollow}
                disabled={busy}
              >
                {following ? (
                  <View style={styles.followingBtn}>
                    <Icon name="check" size={18} color={colors.primary} />
                    <Text style={styles.followingText}>Following</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#1D9E75', '#0E7A57']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.followBtn}
                  >
                    <Icon name="account-plus" size={18} color="#FFFFFF" />
                    <Text style={styles.followText}>Follow</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageBtn}
                activeOpacity={0.85}
                onPress={handleMessage}
                disabled={opening}
              >
                {opening ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Icon
                      name="message-text-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.messageText}>Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <LinearGradient
                colors={['#1D9E75', '#0E7A57']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.followBtn}
              >
                <Icon name="pencil-outline" size={18} color="#FFFFFF" />
                <Text style={styles.followText}>Edit profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Posts</Text>
          {posts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon
                name="image-multiple-outline"
                size={32}
                color={colors.textSecondary}
              />
              <Text style={styles.empty}>No posts yet.</Text>
            </View>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => navigation.navigate('PostDetail', { post })}
                onComment={() => navigation.navigate('PostDetail', { post })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: { flex: 1 },
    scroll: {
      paddingBottom: spacing.huge,
    },
    hero: {
      paddingBottom: spacing.huge + spacing.xl,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
    },
    heroSafe: {
      paddingHorizontal: spacing.xl,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    topTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: '#FFFFFF',
      letterSpacing: -0.3,
      marginHorizontal: spacing.sm,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnGhost: {
      width: 38,
      height: 38,
    },
    heroBody: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    avatarRing: {
      width: 116,
      height: 116,
      borderRadius: 58,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarInner: {
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    name: {
      marginTop: spacing.md,
      fontSize: 24,
      fontWeight: typography.weight.bold,
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    locPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    locText: {
      color: '#FFFFFF',
      fontSize: typography.size.sm,
      marginLeft: 4,
      fontWeight: typography.weight.medium,
    },
    bio: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: typography.size.md,
      marginTop: spacing.md,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      lineHeight: 20,
    },
    statsCardWrap: {
      marginTop: -spacing.xl - spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: spacing.lg,
      shadowColor: '#0E7A57',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 18,
      elevation: 6,
    },
    stat: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    statValue: {
      fontSize: 20,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    statLabel: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    body: {
      paddingHorizontal: spacing.xl,
      marginTop: spacing.xl,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    followBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md + 2,
      borderRadius: 14,
      shadowColor: '#1D9E75',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      elevation: 4,
    },
    followText: {
      color: '#FFFFFF',
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      marginLeft: spacing.sm,
    },
    followingBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md + 2,
      borderRadius: 14,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    followingText: {
      color: colors.primary,
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      marginLeft: spacing.sm,
    },
    messageBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md + 2,
      paddingHorizontal: spacing.lg,
      borderRadius: 14,
      marginLeft: spacing.md,
      backgroundColor: colors.primaryLight,
    },
    messageText: {
      color: colors.primary,
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      marginLeft: spacing.sm,
    },
    sectionTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    empty: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
  });

export default UserProfileScreen;
