import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../core/theme/colors';

import { StorefrontWebViewScreen } from '../presentation/screens/StorefrontWebViewScreen';

void SplashScreen.preventAutoHideAsync();

export function AppBootstrap() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={colors.statusBar}
        barStyle="dark-content"
        translucent
      />
      <StorefrontWebViewScreen />
    </SafeAreaProvider>
  );
}
