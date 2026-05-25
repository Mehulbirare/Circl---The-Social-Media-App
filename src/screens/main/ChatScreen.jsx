import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const CHATS = [
  {
    id: '1',
    name: 'Anaya Shah',
    lastMessage: 'See you at the meetup tomorrow!',
    time: '2m',
    unread: 2,
  },
  {
    id: '2',
    name: 'Karan Patel',
    lastMessage: 'Thanks for sharing the article 🙌',
    time: '20m',
    unread: 0,
  },
  {
    id: '3',
    name: 'Meera Joshi',
    lastMessage: 'Loved your latest post — saving for later!',
    time: '1h',
    unread: 1,
  },
  {
    id: '4',
    name: 'Rahul Desai',
    lastMessage: 'Are we still on for Sunday?',
    time: '3h',
    unread: 0,
  },
  {
    id: '5',
    name: 'Priya Mehta',
    lastMessage: 'Sent you the event details.',
    time: '6h',
    unread: 0,
  },
  {
    id: '6',
    name: 'Aditya Rao',
    lastMessage: 'Great game today!',
    time: '1d',
    unread: 0,
  },
];

const ChatScreen = () => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.header}>
      <Text style={styles.title}>Chats</Text>
      <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
        <Icon name="square-edit-outline" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
    <FlatList
      data={CHATS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Avatar name={item.name} />
          <View style={styles.body}>
            <View style={styles.topLine}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.bottomLine}>
              <Text
                style={[
                  styles.message,
                  item.unread > 0 && styles.messageUnread,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
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
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
});

export default ChatScreen;
