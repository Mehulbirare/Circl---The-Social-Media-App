import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import { getNotifications, markAllAsRead } from '../../services/notificationService';
import { usePostStore } from '../../store/usePostStore';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { SkeletonNotification } from '../../components/skeleton';

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

const NotificationScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const bumpRefresh = usePostStore((s) => s.bumpRefresh);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
      // Mark as read after fetching
      await markAllAsRead();
      bumpRefresh(); // notify HomeScreen and others to update their unread count
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bumpRefresh]);

  useEffect(() => {
    load();
  }, [load]);

  const handleNotificationPress = (item) => {
    if (item.type === 'follow') {
      navigation.navigate('UserProfile', {
        userId: item.sender_id,
        name: item.sender?.full_name,
        avatar: item.sender?.avatar_url,
      });
    } else if (item.post_id) {
      navigation.navigate('PostDetail', {
        post: { id: item.post_id },
      });
    }
  };

  const getNotificationText = (item) => {
    const name = item.sender?.full_name || 'Someone';
    switch (item.type) {
      case 'like':
        return (
          <Text style={styles.text}>
            <Text style={styles.boldText}>{name}</Text> liked your post
          </Text>
        );
      case 'comment':
        return (
          <Text style={styles.text}>
            <Text style={styles.boldText}>{name}</Text> commented:{' '}
            <Text style={styles.commentQuote}>"{item.text}"</Text>
          </Text>
        );
      case 'follow':
        return (
          <Text style={styles.text}>
            <Text style={styles.boldText}>{name}</Text> started following you
          </Text>
        );
      case 'new_post':
        return (
          <Text style={styles.text}>
            <Text style={styles.boldText}>{name}</Text> uploaded a new post
          </Text>
        );
      default:
        return <Text style={styles.text}>New activity from {name}</Text>;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Icon name="heart" size={14} color="#EF4444" />;
      case 'comment':
        return <Icon name="comment" size={14} color="#3B82F6" />;
      case 'follow':
        return <Icon name="account-plus" size={14} color="#1D9E75" />;
      case 'new_post':
        return <Icon name="image-multiple" size={14} color="#8B5CF6" />;
      default:
        return <Icon name="bell" size={14} color={colors.textSecondary} />;
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.row, !item.read && styles.unreadRow]}
        activeOpacity={0.8}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.avatarWrapper}>
          <Avatar
            name={item.sender?.full_name || 'User'}
            uri={item.sender?.avatar_url}
            size={44}
          />
          <View style={[styles.typeIconBadge, { backgroundColor: colors.card }]}>
            {getNotificationIcon(item.type)}
          </View>
        </View>

        <View style={styles.body}>
          {getNotificationText(item)}
          <Text style={styles.time}>{formatRelative(item.created_at)}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      {loading ? (
        <SkeletonNotification.List count={8} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={() => load(false)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconContainer}>
                <Icon name="bell-off-outline" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
              </View>
              <Text style={styles.empty}>No notifications yet</Text>
              <Text style={styles.emptySub}>
                Updates about likes, comments, and followers will appear here.
              </Text>
            </View>
          }
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
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backBtnPlaceholder: {
      width: 36,
    },
    title: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      flexGrow: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    unreadRow: {
      backgroundColor: colors.mode === 'dark' ? 'rgba(34,197,138,0.04)' : 'rgba(29,158,117,0.03)',
    },
    avatarWrapper: {
      position: 'relative',
    },
    typeIconBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    body: {
      flex: 1,
      marginLeft: spacing.lg,
      marginRight: spacing.sm,
    },
    text: {
      fontSize: typography.size.md,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    boldText: {
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    commentQuote: {
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    time: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginTop: 4,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: spacing.xs,
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.massive,
      paddingHorizontal: spacing.xxl,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      opacity: 0.5,
    },
    empty: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptySub: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      paddingHorizontal: spacing.lg,
      lineHeight: 18,
    },
  });

export default NotificationScreen;
