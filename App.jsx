import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
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

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemedStatusBar />
      <AppNavigator />
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
