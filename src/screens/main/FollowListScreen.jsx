import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import { getFollowers, getFollowing } from '../../services/usersService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const FollowListScreen = ({ route, navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { userId, mode = 'followers' } = route.params || {};
  const isFollowers = mode === 'followers';

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = isFollowers
          ? await getFollowers(userId)
          : await getFollowing(userId);
        if (active) setPeople(rows || []);
      } catch (_) {
        if (active) setPeople([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, isFollowers]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isFollowers ? 'Followers' : 'Following'}</Text>
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon
                name="account-group-outline"
                size={32}
                color={colors.textSecondary}
              />
              <Text style={styles.empty}>
                {isFollowers ? 'No followers yet.' : 'Not following anyone yet.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() =>
                navigation.push('UserProfile', {
                  userId: item.id,
                  name: item.full_name,
                  avatar: item.avatar_url,
                })
              }
            >
              <Avatar name={item.full_name} uri={item.avatar_url} />
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.full_name || 'User'}
                </Text>
                {item.city ? (
                  <Text style={styles.sub} numberOfLines={1}>
                    {item.city}
                  </Text>
                ) : null}
              </View>
              <Icon
                name="chevron-right"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
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
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    spacer: {
      width: 24,
    },
    loaderWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.sm,
      flexGrow: 1,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: spacing.huge,
    },
    empty: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    body: {
      flex: 1,
      marginLeft: spacing.md,
    },
    name: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    sub: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

export default FollowListScreen;
