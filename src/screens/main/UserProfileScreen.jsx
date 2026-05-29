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
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../../components/common/Avatar';
import SkeletonProfile from '../../components/skeleton/SkeletonProfile';
import { supabase } from '../../lib/supabase';
import { getProfile, getProfileStats } from '../../services/profileService';
import { getPostsByAuthor } from '../../services/postsService';
import { isFollowing, follow, unfollow } from '../../services/usersService';
import { openChat } from '../../services/chatService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { usePostStore } from '../../store/usePostStore';
import { thumbnailUrlForVideoUrl } from '../../services/imageService';

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
  const [activeTab, setActiveTab] = useState('posts');
  const refreshKey = usePostStore((s) => s.refreshKey);

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
  }, [userId, refreshKey]);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon
              name="image-multiple-outline"
              size={40}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.empty}>No posts yet.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {posts.map((post) => {
              const isVideo = post.imageUrl && /\.(mp4|mov|m4v|webm|3gp)(\?|$)/i.test(post.imageUrl);
              const thumbUrl = isVideo ? thumbnailUrlForVideoUrl(post.imageUrl) : null;
              const mediaUri = isVideo ? (thumbUrl || post.imageUrl) : post.imageUrl;

              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridItem}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('PostDetail', { post })}
                >
                  {post.imageUrl ? (
                    <Image source={{ uri: mediaUri }} style={styles.gridImage} />
                  ) : (
                    <View style={styles.gridTextContainer}>
                      <Text style={styles.gridText} numberOfLines={4}>
                        {post.text}
                      </Text>
                    </View>
                  )}
                  {isVideo && (
                    <View style={styles.videoBadge}>
                      <Icon name="play" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      case 'about':
        return (
          <View style={styles.aboutContainer}>
            {city ? (
              <View style={styles.aboutRow}>
                <View style={styles.aboutIconContainer}>
                  <Icon name="map-marker-outline" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.aboutContent}>
                  <Text style={styles.aboutLabel}>Location</Text>
                  <Text style={styles.aboutValue}>
                    {region ? `${city}, ${region}` : city}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.aboutRow}>
              <View style={styles.aboutIconContainer}>
                <Icon name="calendar-blank-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Joined</Text>
                <Text style={styles.aboutValue}>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Unknown'}
                </Text>
              </View>
            </View>

            {profile?.gender ? (
              <View style={styles.aboutRow}>
                <View style={styles.aboutIconContainer}>
                  <Icon name="gender-male-female" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.aboutContent}>
                  <Text style={styles.aboutLabel}>Gender</Text>
                  <Text style={styles.aboutValue}>
                    {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverBanner}>
          <LinearGradient
            colors={colors.mode === 'dark' ? ['#0A3B2B', '#071510'] : ['#1D9E75', '#0E7A57']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView edges={['top']} style={styles.topBar}>
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
          </SafeAreaView>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Avatar name={name} size={90} uri={avatar} />
            </View>
            {isSelf ? (
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, following ? styles.btnOutline : styles.btnSolid]}
                  activeOpacity={0.85}
                  onPress={handleToggleFollow}
                  disabled={busy}
                >
                  {following ? (
                    <>
                      <Icon name="check" size={16} color={colors.textPrimary} style={styles.btnIcon} />
                      <Text style={styles.btnOutlineText}>Following</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="account-plus-outline" size={16} color="#FFFFFF" style={styles.btnIcon} />
                      <Text style={styles.btnSolidText}>Follow</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnSecondary]}
                  activeOpacity={0.85}
                  onPress={handleMessage}
                  disabled={opening}
                >
                  {opening ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Icon
                        name="message-text-outline"
                        size={16}
                        color={colors.primary}
                        style={styles.btnIcon}
                      />
                      <Text style={styles.btnSecondaryText}>Message</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.name}>{name}</Text>

          <View style={styles.metaRow}>
            {city ? (
              <View style={styles.metaItem}>
                <Icon name="map-marker-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {region ? `${city}, ${region}` : city}
                </Text>
              </View>
            ) : null}
            {profile?.created_at ? (
              <View style={styles.metaItem}>
                <Icon name="calendar-blank-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            ) : null}
          </View>

          {bio ? <Text style={styles.bio}>{bio}</Text> : null}

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
              onPress={() =>
                navigation.push('FollowList', { userId, mode: 'followers' })
              }
            >
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
              onPress={() =>
                navigation.push('FollowList', { userId, mode: 'following' })
              }
            >
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text style={styles.statLabel}>following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'posts' && styles.activeTabItem]}
            onPress={() => setActiveTab('posts')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'posts' && styles.activeTabLabel]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'about' && styles.activeTabItem]}
            onPress={() => setActiveTab('about')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'about' && styles.activeTabLabel]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContentContainer}>{renderTabContent()}</View>
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
    scroll: {
      paddingBottom: spacing.huge,
    },
    coverBanner: {
      height: 140,
      position: 'relative',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
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
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnGhost: {
      width: 38,
      height: 38,
    },
    profileHeader: {
      paddingHorizontal: spacing.xl,
      marginTop: -45,
      marginBottom: spacing.sm,
    },
    avatarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    avatarContainer: {
      borderWidth: 4,
      borderColor: colors.card,
      borderRadius: 49,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 5,
    },
    editBtn: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm - 2,
      backgroundColor: colors.card,
    },
    editBtnText: {
      color: colors.textPrimary,
      fontSize: typography.size.sm + 1,
      fontWeight: typography.weight.bold,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm - 2,
      paddingHorizontal: spacing.md + 2,
      borderRadius: 20,
      marginLeft: spacing.sm,
    },
    btnSolid: {
      backgroundColor: colors.primary,
    },
    btnSolidText: {
      color: '#FFFFFF',
      fontSize: typography.size.sm + 1,
      fontWeight: typography.weight.bold,
    },
    btnOutline: {
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    btnOutlineText: {
      color: colors.textPrimary,
      fontSize: typography.size.sm + 1,
      fontWeight: typography.weight.bold,
    },
    btnSecondary: {
      backgroundColor: colors.primaryLight,
    },
    btnSecondaryText: {
      color: colors.primary,
      fontSize: typography.size.sm + 1,
      fontWeight: typography.weight.bold,
    },
    name: {
      fontSize: 22,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginTop: spacing.md,
      letterSpacing: -0.3,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.lg,
      marginBottom: spacing.xs,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: typography.size.sm,
      marginLeft: 4,
      fontWeight: typography.weight.medium,
    },
    bio: {
      color: colors.textPrimary,
      fontSize: typography.size.md,
      lineHeight: 20,
      marginTop: spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.xl,
    },
    statNumber: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.md,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTabItem: {
      borderBottomColor: colors.primary,
    },
    tabLabel: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.medium,
      color: colors.textSecondary,
    },
    activeTabLabel: {
      color: colors.primary,
      fontWeight: typography.weight.bold,
    },
    tabContentContainer: {
      paddingTop: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.sm,
      marginTop: spacing.xs,
    },
    gridItem: {
      width: '33.33%',
      aspectRatio: 1,
      padding: 1,
      position: 'relative',
    },
    gridImage: {
      width: '100%',
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    gridTextContainer: {
      width: '100%',
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridText: {
      fontSize: 10,
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 14,
      fontWeight: typography.weight.medium,
    },
    videoBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.6)',
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.massive,
      paddingHorizontal: spacing.xxl,
    },
    emptyIcon: {
      opacity: 0.6,
      marginBottom: spacing.sm,
    },
    empty: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    btnIcon: {
      marginRight: 4,
    },
    aboutContainer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    aboutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    aboutIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    aboutContent: {
      flex: 1,
    },
    aboutLabel: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: typography.weight.bold,
    },
    aboutValue: {
      fontSize: typography.size.md,
      color: colors.textPrimary,
      fontWeight: typography.weight.medium,
      marginTop: 2,
    },
  });

export default UserProfileScreen;
