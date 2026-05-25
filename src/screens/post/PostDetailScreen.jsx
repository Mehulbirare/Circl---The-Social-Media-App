import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import PostActions from '../../components/feed/PostActions';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const MOCK_COMMENTS = [
  {
    id: 'c1',
    author: 'Karan Patel',
    text: "Count me in! I'll bring an extra racquet.",
    time: '3m ago',
  },
  {
    id: 'c2',
    author: 'Meera Joshi',
    text: "Sounds great, I'll bring a friend along too.",
    time: '12m ago',
  },
  {
    id: 'c3',
    author: 'Rahul Desai',
    text: 'Is parking available there?',
    time: '20m ago',
  },
];

const PostDetailScreen = ({ route, navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const post = route?.params?.post || {
    id: '0',
    author: 'Anaya Shah',
    time: '5m ago',
    distance: '0.4 km away',
    text: 'Anyone up for badminton at City Light Garden this evening around 6pm?',
    likes: 12,
    comments: 3,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <Avatar name={post.author} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{post.author}</Text>
            <Text style={styles.meta}>
              {post.distance} • {post.time}
            </Text>
          </View>
        </View>
        <Text style={styles.body}>{post.text}</Text>
        {post.image ? <View style={styles.imagePlaceholder} /> : null}
        <PostActions post={post} />
        <Text style={styles.commentsTitle}>Comments</Text>
        {MOCK_COMMENTS.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Avatar name={c.author} size={36} />
            <View style={styles.commentBody}>
              <Text style={styles.commentAuthor}>{c.author}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
              <Text style={styles.commentTime}>{c.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    backBtn: {
      width: 24,
    },
    headerTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    scroll: {
      padding: spacing.lg,
      paddingBottom: spacing.huge,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerText: {
      marginLeft: spacing.md,
    },
    name: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    meta: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    body: {
      fontSize: typography.size.lg,
      color: colors.textPrimary,
      lineHeight: 26,
      marginBottom: spacing.lg,
    },
    imagePlaceholder: {
      height: 220,
      backgroundColor: colors.primaryLight,
      borderRadius: 12,
      marginBottom: spacing.lg,
    },
    commentsTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    comment: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    commentBody: {
      flex: 1,
      marginLeft: spacing.md,
    },
    commentAuthor: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    commentText: {
      fontSize: typography.size.md,
      color: colors.textPrimary,
      marginTop: 2,
      lineHeight: 20,
    },
    commentTime: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });

export default PostDetailScreen;
