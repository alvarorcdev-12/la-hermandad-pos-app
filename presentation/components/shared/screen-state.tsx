import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type Props = { icon: LucideIcon; title: string; description: string };

export function ScreenState({ icon, title, description }: Props) {
  return (
    <View className="items-center gap-3 px-6 py-12">
      <View className="mb-2 h-16 w-16 items-center justify-center rounded-lg bg-muted">
        <Icon as={icon} size={28} className="text-muted-foreground" />
      </View>
      <Text className="text-center text-lg font-semibold">{title}</Text>
      <Text className="max-w-sm text-center text-sm leading-6 text-muted-foreground">
        {description}
      </Text>
    </View>
  );
}
