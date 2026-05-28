import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeedList from '../../components/feed/FeedList';
import SkeletonFeed from '../../components/skeleton/SkeletonFeed';
import { useLocationStore } from '../../store/useLocationStore';
import { usePostStore } from '../../store/usePostStore';
import { getFeed } from '../../services/postsService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const PAGE_SIZE = 20;
const LOAD_TIMEOUT_MS = 15000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timed out. Check your connection.')),
        ms,
      ),
    ),
  ]);

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
  const w = Math.floor(d / 7);
  return `${w}w ago`;
};

const formatDistance = (km) => {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
};

const mapPost = (row) => ({
  id: row.id,
  author: row.author_name || 'Someone nearby',
  authorAvatar: row.author_avatar,
  time: formatRelative(row.created_at),
  distance: formatDistance(row.distance_km),
  text: row.text,
  image: !!row.image_url,
  imageUrl: row.image_url,
  likes: row.likes_count ?? 0,
  comments: row.comments_count ?? 0,
  lat: row.lat,
  lng: row.lng,
  created_at: row.created_at,
});

const HomeScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const city = useLocationStore((s) => s.city);
  const region = useLocationStore((s) => s.region);
  const refreshKey = usePostStore((s) => s.refreshKey);
  const postStats = usePostStore((s) => s.postStats);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const loadingMoreRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    const rows = await withTimeout(
      getFeed({ offset: 0, limit: PAGE_SIZE }),
      LOAD_TIMEOUT_MS,
    );
    setPosts((rows || []).map(mapPost));
    setHasMore((rows || []).length === PAGE_SIZE);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const rows = await withTimeout(
        getFeed({ offset: posts.length, limit: PAGE_SIZE }),
        LOAD_TIMEOUT_MS,
      );
      const mapped = (rows || []).map(mapPost);
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...mapped.filter((p) => !seen.has(p.id))];
      });
      setHasMore(mapped.length === PAGE_SIZE);
    } catch (_) {
      // keep what we have; pull-to-refresh or scroll can retry
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, posts.length]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (active) setError(e?.message || 'Could not load the feed.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load, refreshKey]);

  const handleRetry = async () => {
    setLoading(true);
    try {
      await load();
    } catch (e) {
      setError(e?.message || 'Could not load the feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setError(e?.message || 'Could not load the feed.');
    } finally {
      setRefreshing(false);
    }
  };

  const displayPosts = posts.map((p) => {
    const override = postStats[p.id]?.comments;
    return override == null
      ? p
      : { ...p, comments: Math.max(p.comments ?? 0, override) };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.circle} />
          <Text style={styles.logo}>Circl</Text>
        </View>
        <TouchableOpacity style={styles.bell} activeOpacity={0.7}>
          <Icon name="bell-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <View style={styles.locationRow}>
        <View style={styles.pill}>
          <Icon name="map-marker" size={14} color={colors.primary} />
          <Text style={styles.pillText}>
            {city}, {region}
          </Text>
        </View>
      </View>
      {loading ? (
        <SkeletonFeed count={4} />
      ) : error && posts.length === 0 ? (
        <View style={styles.errorBox}>
          <Icon name="cloud-off-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Couldn't load the feed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.8}
            onPress={handleRetry}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FeedList
          posts={displayPosts}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={loadMore}
          loadingMore={loadingMore}
          onPressPost={(post) => navigation.navigate('PostDetail', { post })}
        />
      )}
    </SafeAreaView>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    errorBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    errorTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginTop: spacing.md,
    },
    errorText: {
      fontSize: typography.size.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    retryBtn: {
      marginTop: spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: 24,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
    },
    retryText: {
      color: '#FFFFFF',
      fontSize: typography.size.md,
      fontWeight: typography.weight.medium,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    circle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 3,
      borderColor: colors.primary,
      marginRight: spacing.sm,
    },
    logo: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: colors.primary,
    },
    bell: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationRow: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryLight,
      borderRadius: 24,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    pillText: {
      color: colors.primary,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      marginLeft: spacing.xs,
    },
  });

export default HomeScreen;
