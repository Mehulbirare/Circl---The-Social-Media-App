import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import { getFollowing, searchUsers } from '../../services/usersService';
import { openChat } from '../../services/chatService';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const NewChatScreen = ({ navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await getFollowing();
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
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return undefined;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const rows = await searchUsers(q);
        setSearchResults(rows || []);
      } catch (_) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const data = useMemo(
    () => (searchResults == null ? people : searchResults),
    [people, searchResults],
  );

  const startChat = async (person) => {
    if (openingId) return;
    setOpeningId(person.id);
    try {
      const chatId = await openChat(person.id);
      navigation.replace('ChatThread', {
        chatId,
        other: {
          id: person.id,
          full_name: person.full_name,
          avatar_url: person.avatar_url,
        },
      });
    } catch (err) {
      Alert.alert('Could not start chat', err.message || 'Please try again.');
    } finally {
      setOpeningId(null);
    }
  };

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
        <Text style={styles.title}>New message</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search people"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {searchResults == null ? 'People you follow' : 'Search results'}
            </Text>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {searchResults == null
                ? 'You are not following anyone yet. Search to find people.'
                : 'No matches.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => startChat(item)}
              disabled={!!openingId}
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
              {openingId === item.id ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Icon
                  name="message-text-outline"
                  size={22}
                  color={colors.primary}
                />
              )}
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
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    search: {
      flex: 1,
      height: 44,
      marginLeft: spacing.sm,
      color: colors.textPrimary,
      fontSize: typography.size.md,
    },
    loaderWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.sm,
    },
    sectionTitle: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    empty: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      paddingVertical: spacing.md,
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

export default NewChatScreen;
