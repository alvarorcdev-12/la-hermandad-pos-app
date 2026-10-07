import { Stack } from 'expo-router';

const PosLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="customers" />
    </Stack>
  );
};

export default PosLayout;
