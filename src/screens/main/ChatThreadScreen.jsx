import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import { getMessages, sendMessage, markRead } from '../../services/chatService';
import { supabase } from '../../lib/supabase';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const ChatThreadScreen = ({ route, navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { chatId, other } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState(null);
  const seen = useRef(new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setMyId(user?.id || null);

      const rows = await getMessages(chatId);
      if (!active) return;
      const reversed = (rows || []).slice().reverse();
      reversed.forEach((m) => seen.current.add(m.id));
      setMessages(reversed);

      markRead(chatId);
    })();

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const row = payload.new;
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);
          setMessages((prev) => [row, ...prev]);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      const msg = await sendMessage(chatId, text);
      if (!seen.current.has(msg.id)) {
        seen.current.add(msg.id);
        setMessages((prev) => [msg, ...prev]);
      }
    } catch (err) {
      setDraft(text);
      Alert.alert('Could not send', err.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const mine = item.sender_id === myId;
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={mine ? styles.textMine : styles.textOther}>{item.text}</Text>
        </View>
      </View>
    );
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
        <Avatar
          name={other?.full_name || 'User'}
          size={36}
          uri={other?.avatar_url}
        />
        <View style={styles.headerText}>
          <Text style={styles.headerName} numberOfLines={1}>
            {other?.full_name || 'Chat'}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          inverted
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!draft.trim() || sending}
          >
            <Icon name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerText: {
      marginLeft: spacing.md,
      flex: 1,
    },
    headerName: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    bubbleRow: {
      flexDirection: 'row',
      marginVertical: 4,
    },
    rowRight: {
      justifyContent: 'flex-end',
    },
    rowLeft: {
      justifyContent: 'flex-start',
    },
    bubble: {
      maxWidth: '78%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderRadius: 16,
    },
    bubbleMine: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleOther: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 4,
    },
    textMine: {
      color: '#FFFFFF',
      fontSize: typography.size.md,
      lineHeight: 20,
    },
    textOther: {
      color: colors.textPrimary,
      fontSize: typography.size.md,
      lineHeight: 20,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.textPrimary,
      fontSize: typography.size.md,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
  });

export default ChatThreadScreen;
