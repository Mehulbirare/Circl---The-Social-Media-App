import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import SkeletonChatRow from '../../components/skeleton/SkeletonChatRow';
import { getChats } from '../../services/chatService';
import { useChatStore } from '../../store/useChatStore';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const formatRelative = (iso) => {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
};

const ChatScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const bumpKey = useChatStore((s) => s.bumpKey);
  const unreadByChat = useChatStore((s) => s.unreadByChat);

  const load = useCallback(async () => {
    const rows = await getChats();
    setChats(rows || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load, bumpKey]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="square-edit-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.content}>
          <SkeletonChatRow.List count={6} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No conversations yet. Say hi to someone nearby.
            </Text>
          }
          renderItem={({ item }) => {
            const unread = unreadByChat[item.id] || 0;
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('ChatThread', {
                    chatId: item.id,
                    other: item.other,
                  })
                }
              >
                <Avatar
                  name={item.other?.full_name || 'User'}
                  uri={item.other?.avatar_url}
                />
                <View style={styles.body}>
                  <View style={styles.topLine}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.other?.full_name || 'User'}
                    </Text>
                    <Text style={styles.time}>{formatRelative(item.updatedAt)}</Text>
                  </View>
                  <View style={styles.bottomLine}>
                    <Text
                      style={[styles.message, unread > 0 && styles.messageUnread]}
                      numberOfLines={1}
                    >
                      {item.lastMessage || 'Tap to start chatting'}
                    </Text>
                    {unread > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {unread > 9 ? '9+' : unread}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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
    title: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.sm,
    },
    empty: {
      textAlign: 'center',
      color: colors.textSecondary,
      paddingVertical: spacing.huge,
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
    topLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    name: {
      flex: 1,
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    time: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    bottomLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    message: {
      flex: 1,
      fontSize: typography.size.sm,
      color: colors.textSecondary,
    },
    messageUnread: {
      color: colors.textPrimary,
      fontWeight: typography.weight.medium,
    },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 6,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    unreadText: {
      color: '#FFFFFF',
      fontSize: typography.size.xs,
      fontWeight: typography.weight.bold,
    },
  });

export default ChatScreen;
