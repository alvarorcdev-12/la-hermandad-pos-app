// const SCREEN_OPTIONS = {
//   title: 'React Native Reusables',
//   headerTransparent: true,
//   headerRight: () => <ThemeToggle />,
// };

import { Redirect } from 'expo-router';

export default function Screen() {
  return (
    <>
      {/* <Stack.Screen options={SCREEN_OPTIONS} /> */}
      <Redirect href="/(pos)/(tabs)/(home)" />
    </>
  );
}

// const THEME_ICONS = {
//   light: SunIcon,
//   dark: MoonStarIcon,
// };

// function ThemeToggle() {
//   const { colorScheme, toggleColorScheme } = useColorScheme();

//   return (
//     <Button
//       onPressIn={toggleColorScheme}
//       size="icon"
//       variant="ghost"
//       className="ios:size-9 rounded-full web:mx-4">
//       <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
//     </Button>
//   );
// }
