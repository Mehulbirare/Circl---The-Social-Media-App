import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AppState, StatusBar } from 'react-native';
import codePush from '@code-push-next/react-native-code-push';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import Loader from './src/components/common/Loader';
import { useAuthStore } from './src/store/useAuthStore';
import { useLocationStore } from './src/store/useLocationStore';
import { getSession, onAuthChange } from './src/services/authService';
import { getMyProfile } from './src/services/profileService';
import { useColors } from './src/theme/useColors';

const syncCodePush = () => {
  codePush.sync({
    installMode: codePush.InstallMode.ON_NEXT_RESTART,
    mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  });
};

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

    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();
        if (active) login(profile);
      } catch (_) {
        // profile fetch failed — likely RLS race; ignore
      }
    };

    (async () => {
      try {
        const session = await getSession();
        if (session && active) {
          await loadProfile();
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

    const { data: sub } = onAuthChange((session) => {
      if (!active) return;
      // Defer out of the callback: Supabase fires this while holding its
      // internal auth lock, so awaiting any supabase.auth/db call here
      // re-acquires that lock and deadlocks (app hangs on the splash
      // spinner on relaunch when a session is persisted).
      setTimeout(() => {
        if (!active) return;
        if (session) {
          loadProfile();
        } else {
          logout();
        }
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [login, logout, setHydrated, initLocation]);

  if (hydrating) return <Loader />;
  return <AppNavigator />;
};

const App = () => {
  useEffect(() => {
    syncCodePush();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncCodePush();
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemedStatusBar />
        <AppShell />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
