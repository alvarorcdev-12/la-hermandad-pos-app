import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export type ActionBottomSheetProps = PropsWithChildren<{
  title?: string;
  visible: boolean;
  onClose: () => void;
}>;

export function ActionBottomSheet({ title, children, visible, onClose }: ActionBottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          className="absolute inset-0 bg-black/60"
          onPress={onClose}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        />
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          className="max-h-[85%] rounded-t-3xl border border-border bg-card pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}>
          <View className="h-1 w-10 self-center rounded-full bg-muted-foreground/40" />
          <View className="flex-row items-center justify-between gap-3 px-5 pb-2 pt-2">
            <View className="flex-1">
              {title && (
                <Text accessibilityRole="header" className="text-lg font-semibold">
                  {title}
                </Text>
              )}
            </View>
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel="Cerrar acciones"
              onPress={onClose}>
              <Icon as={XIcon} size={20} className="text-muted-foreground" />
            </Button>
          </View>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-4 px-5 pb-2">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
