import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../../components/common/Avatar';
import SkeletonProfile from '../../components/skeleton/SkeletonProfile';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { usePostStore } from '../../store/usePostStore';
import { getMyProfile, getProfileStats } from '../../services/profileService';
import { getPostsByAuthor } from '../../services/postsService';
import { signOut } from '../../services/authService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
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

const ProfileScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const storeCity = useLocationStore((s) => s.city);
  const storeRegion = useLocationStore((s) => s.region);
  const refreshKey = usePostStore((s) => s.refreshKey);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await getMyProfile();
        if (!active) return;
        login(profile);
        const [s, fp] = await Promise.all([
          getProfileStats(profile.id),
          getPostsByAuthor(profile.id),
        ]);
        if (!active) return;
        setStats(s);
        setPosts((fp || []).map(mapPost));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [login, refreshKey]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      Alert.alert('Could not log out', err.message || 'Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SkeletonProfile />
      </View>
    );
  }

  const name = user?.full_name || 'You';
  const bio = user?.bio || 'Building communities, one neighbourhood at a time.';
  const avatar = user?.avatar_url || null;
  const city = user?.city || storeCity;
  const region = user?.region || storeRegion;

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

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
            <Text style={styles.empty}>You haven't posted yet.</Text>
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
      case 'saved':
        return (
          <View style={styles.emptyWrap}>
            <Icon
              name="bookmark-outline"
              size={40}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.empty}>No saved posts</Text>
            <Text style={styles.emptySub}>Posts you save will appear here.</Text>
          </View>
        );
      case 'about':
        return (
          <View style={styles.aboutContainer}>
            <View style={styles.aboutRow}>
              <View style={styles.aboutIconContainer}>
                <Icon name="email-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Email</Text>
                <Text style={styles.aboutValue}>{user?.email || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.aboutRow}>
              <View style={styles.aboutIconContainer}>
                <Icon name="phone-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Mobile</Text>
                <Text style={styles.aboutValue}>{user?.mobile || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.aboutRow}>
              <View style={styles.aboutIconContainer}>
                <Icon name="cake-variant-outline" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Birthday</Text>
                <Text style={styles.aboutValue}>
                  {user?.dob
                    ? new Date(user.dob).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.aboutRow}>
              <View style={styles.aboutIconContainer}>
                <Icon name="gender-male-female" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Gender</Text>
                <Text style={styles.aboutValue}>
                  {user?.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : 'Not specified'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Icon name="logout" size={18} color={colors.danger} />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
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
            <Text style={styles.topTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon name="cog-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Avatar name={name} size={90} uri={avatar} />
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editBtnText}>Edit profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{name}</Text>

          <View style={styles.metaRow}>
            {city ? (
              <View style={styles.metaItem}>
                <Icon name="map-marker-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {city}, {region}
                </Text>
              </View>
            ) : null}
            {joinedDate ? (
              <View style={styles.metaItem}>
                <Icon name="calendar-blank-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>Joined {joinedDate}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.bio}>{bio}</Text>

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
                navigation.navigate('FollowList', {
                  userId: user?.id,
                  mode: 'followers',
                })
              }
            >
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('FollowList', {
                  userId: user?.id,
                  mode: 'following',
                })
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
            style={[styles.tabItem, activeTab === 'saved' && styles.activeTabItem]}
            onPress={() => setActiveTab('saved')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'saved' && styles.activeTabLabel]}>
              Saved
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
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: '#FFFFFF',
      letterSpacing: -0.3,
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
    emptySub: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
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
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xxl,
      paddingVertical: spacing.md + 2,
      borderRadius: 14,
      backgroundColor: colors.logoutBackground,
      marginBottom: spacing.xl,
    },
    logoutText: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.danger,
      marginLeft: spacing.sm,
    },
  });

export default ProfileScreen;

