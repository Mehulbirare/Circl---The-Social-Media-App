import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ChatThreadScreen from '../screens/main/ChatThreadScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import BottomTabBar from '../components/navigation/BottomTabBar';
import NotificationBanner from '../components/notifications/NotificationBanner';
import { useGlobalChatSubscription } from '../hooks/useGlobalChatSubscription';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Tabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <BottomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Create" component={CreatePostScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainNavigator = () => {
  useGlobalChatSubscription();
  return (
    <View style={styles.root}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      </Stack.Navigator>
      <NotificationBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default MainNavigator;
