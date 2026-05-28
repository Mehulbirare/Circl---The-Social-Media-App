import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors, useThemedStyles } from '../../theme/useColors';
import { useChatStore, selectTotalUnread } from '../../store/useChatStore';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const TAB_ICONS = {
  Home: 'home-variant',
  Explore: 'compass-outline',
  Create: 'plus',
  Chat: 'chat-outline',
  Profile: 'account-outline',
};

const BottomTabBar = ({ state, navigation }) => {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const totalUnread = useChatStore(selectTotalUnread);
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isCreate = route.name === 'Create';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCreate) {
          return (
            <View key={route.key} style={styles.createSlot}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={onPress}
                activeOpacity={0.85}
              >
                <Icon name={TAB_ICONS.Create} size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        }

        const showBadge = route.name === 'Chat' && totalUnread > 0;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Icon
                name={TAB_ICONS[route.name] || 'circle-outline'}
                size={24}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
              {showBadge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[styles.label, isFocused && styles.labelActive]}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'flex-start',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xs,
    },
    iconWrap: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: typography.weight.bold,
      lineHeight: 13,
    },
    label: {
      fontSize: typography.size.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    labelActive: {
      color: colors.primary,
      fontWeight: typography.weight.medium,
    },
    createSlot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -spacing.xl,
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  });

export default BottomTabBar;
