import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeedList from '../../components/feed/FeedList';
import { useLocationStore } from '../../store/useLocationStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const MOCK_POSTS = [
  {
    id: '1',
    author: 'Anaya Shah',
    time: '5m ago',
    distance: '0.4 km away',
    text: 'Anyone up for badminton at City Light Garden this evening around 6pm? Need two more players.',
    likes: 12,
    comments: 3,
  },
  {
    id: '2',
    author: 'Karan Patel',
    time: '32m ago',
    distance: '1.2 km away',
    text: 'Lost a beagle near Piplod. Brown collar, very friendly, answers to Coco. Please DM if you spot her.',
    likes: 28,
    comments: 14,
    image: true,
  },
  {
    id: '3',
    author: 'Meera Joshi',
    time: '1h ago',
    distance: '2.1 km away',
    text: 'New filter coffee place just opened in Vesu. The cold brew is incredible — highly recommend stopping by this weekend.',
    likes: 47,
    comments: 9,
  },
  {
    id: '4',
    author: 'Rahul Desai',
    time: '3h ago',
    distance: '3.6 km away',
    text: 'Quick poll: best paani puri in Surat? Need backup for an ongoing argument with my roommate.',
    likes: 89,
    comments: 42,
  },
  {
    id: '5',
    author: 'Priya Mehta',
    time: '5h ago',
    distance: '4.8 km away',
    text: 'Hosting an open mic night at the cafe tomorrow at 8pm. Poets, musicians, comedians — all artists welcome!',
    likes: 33,
    comments: 7,
    image: true,
  },
];

const HomeScreen = ({ navigation }) => {
  const city = useLocationStore((s) => s.city);
  const region = useLocationStore((s) => s.region);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
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
      <FeedList
        posts={MOCK_POSTS}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onPressPost={(post) => navigation.navigate('PostDetail', { post })}
      />
    </SafeAreaView>
  );
};

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
