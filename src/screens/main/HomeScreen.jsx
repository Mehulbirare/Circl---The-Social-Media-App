import React, { useCallback, useEffect, useState } from 'react';
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
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rows = await getFeed();
    setPosts((rows || []).map(mapPost));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load, refreshKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

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
      ) : (
        <FeedList
          posts={posts}
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
