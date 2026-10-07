import { useEffect } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, ReduceMotion } from 'react-native-reanimated';
import { CircleAlertIcon, InfoIcon, XIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: 'error' | 'info';
  onClose: () => void;
}

const variants = {
  error: {
    container: 'border-destructive/30 bg-destructive/10',
    icon: CircleAlertIcon,
    color: 'text-destructive',
  },
  info: {
    container: 'border-primary/30 bg-accent',
    icon: InfoIcon,
    color: 'text-primary-emphasis',
  },
};
const entering = FadeInDown.duration(180)
  .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] })
  .reduceMotion(ReduceMotion.System);
const exiting = FadeOutUp.duration(140)
  .withInitialValues({ opacity: 1, transform: [{ translateY: 0 }] })
  .reduceMotion(ReduceMotion.System);

/** Mantener montada y controlar `visible` permite reproducir también la salida. */
export function Alert({ visible, title, message, variant = 'info', onClose }: AlertProps) {
  const appearance = variants[variant];

  useEffect(() => {
    if (visible && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(`${title}. ${message}`);
    }
  }, [visible, title, message]);

  return (
    <View collapsable={false}>
      {visible && (
        <Animated.View entering={entering} exiting={exiting}>
          <View
            className={cn(
              'mb-4 flex-row items-start gap-3 rounded-xl border p-3',
              appearance.container
            )}>
            <View
              className="pt-1"
              accessible={false}
              importantForAccessibility="no-hide-descendants">
              <Icon as={appearance.icon} size={24} className={appearance.color} />
            </View>
            <View
              className="min-w-0 flex-1 gap-1 pt-1"
              accessible
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              accessibilityLabel={`${title}. ${message}`}>
              <Text className="font-semibold text-foreground">{title}</Text>
              <Text className="text-sm leading-6 text-foreground">{message}</Text>
            </View>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 sm:h-12 sm:w-12"
              accessibilityLabel="Cerrar alerta"
              onPress={onClose}>
              <Icon as={XIcon} size={20} className="text-muted-foreground" />
            </Button>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
