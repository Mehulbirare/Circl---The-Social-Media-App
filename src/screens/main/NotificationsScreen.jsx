import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const NOTIFICATIONS = [
  {
    id: '1',
    name: 'Anaya Shah',
    text: 'liked your post about the badminton meetup',
    time: '2m ago',
  },
  {
    id: '2',
    name: 'Karan Patel',
    text: 'started following you',
    time: '15m ago',
  },
  {
    id: '3',
    name: 'Meera Joshi',
    text: 'commented: "Loved this — saving for later!"',
    time: '1h ago',
  },
  {
    id: '4',
    name: 'Rahul Desai',
    text: 'mentioned you in a post',
    time: '3h ago',
  },
  {
    id: '5',
    name: 'Priya Mehta',
    text: 'invited you to an event nearby',
    time: '6h ago',
  },
];

const NotificationsScreen = () => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.header}>
      <Text style={styles.title}>Notifications</Text>
    </View>
    <FlatList
      data={NOTIFICATIONS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Avatar name={item.name} />
          <View style={styles.body}>
            <Text style={styles.text}>
              <Text style={styles.name}>{item.name} </Text>
              {item.text}
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
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
  text: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    lineHeight: 20,
  },
  name: {
    fontWeight: typography.weight.bold,
  },
  time: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default NotificationsScreen;
