import '@/global.css';

import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { NAV_THEME } from '@/lib/theme';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
// import { colorScheme } from 'nativewind';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/query-client';

// colorScheme.set('dark');

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        {/* <ThemeProvider value={NAV_THEME.dark}> */}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        {/* <StatusBar style={'light'} /> */}

        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
