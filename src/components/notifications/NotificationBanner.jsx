import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../common/Avatar';
import { useChatStore } from '../../store/useChatStore';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { navigate } from '../../navigation/navigationRef';

const AUTO_DISMISS_MS = 4500;
const SLIDE_OFFSCREEN = -200;

const NotificationBanner = () => {
  const banner = useChatStore((s) => s.banner);
  const clearBanner = useChatStore((s) => s.clearBanner);
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const translateY = useRef(new Animated.Value(SLIDE_OFFSCREEN)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!banner) return undefined;

    try {
      Vibration.vibrate(Platform.OS === 'android' ? 80 : 30);
    } catch {}

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: SLIDE_OFFSCREEN,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) clearBanner();
      });
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [banner, translateY, clearBanner]);

  if (!banner) return null;

  const handlePress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate('ChatThread', {
      chatId: banner.chatId,
      other: banner.other,
    });
    clearBanner();
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, {
      toValue: SLIDE_OFFSCREEN,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) clearBanner();
    });
  };

  const senderName = banner.other?.full_name || 'New message';

  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: insets.top + spacing.sm, transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <Avatar
          name={senderName}
          uri={banner.other?.avatar_url}
          size={40}
        />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {banner.text || ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={12}
          activeOpacity={0.7}
          style={styles.closeBtn}
        >
          <Icon name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      zIndex: 1000,
      elevation: 12,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    body: {
      flex: 1,
      marginLeft: spacing.md,
      marginRight: spacing.sm,
    },
    name: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
    },
    message: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default NotificationBanner;
