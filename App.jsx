import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import Loader from './src/components/common/Loader';
import { useAuthStore } from './src/store/useAuthStore';
import { useLocationStore } from './src/store/useLocationStore';
import { getSession, onAuthChange } from './src/services/authService';
import { getMyProfile } from './src/services/profileService';
import { useColors } from './src/theme/useColors';

const ThemedStatusBar = () => {
  const colors = useColors();
  return (
    <StatusBar
      barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor={colors.background}
    />
  );
};

const AppShell = () => {
  const hydrating = useAuthStore((s) => s.hydrating);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const initLocation = useLocationStore((s) => s.init);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const session = await getSession();
        if (session && active) {
          const profile = await getMyProfile();
          login(profile);
        }
      } catch (_) {
        // ignore — user just stays logged out
      } finally {
        if (active) {
          setHydrated();
          initLocation();
        }
      }
    })();

    const { data: sub } = onAuthChange(async (session) => {
      if (!active) return;
      if (session) {
        try {
          const profile = await getMyProfile();
          login(profile);
        } catch (_) {
          // profile fetch failed — likely RLS race; ignore
        }
      } else {
        logout();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [login, logout, setHydrated, initLocation]);

  if (hydrating) return <Loader />;
  return <AppNavigator />;
};

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemedStatusBar />
      <AppShell />
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
