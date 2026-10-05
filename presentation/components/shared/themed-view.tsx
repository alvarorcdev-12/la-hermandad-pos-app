import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends ViewProps {
  safe?: boolean;
}

export const ThemedView = ({ safe, className, style, children, ...props }: Props) => {
  const safeArea = useSafeAreaInsets();

  return (
    <View
      style={[
        safe && {
          paddingTop: safeArea.top,
          paddingHorizontal: 12,
        },
        {
          flex: 1,
        },
        style,
      ]}
      className={className}
      {...props}>
      {children}
    </View>
  );
};
