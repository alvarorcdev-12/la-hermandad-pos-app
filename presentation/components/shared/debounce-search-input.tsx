import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScanBarcode, SearchIcon, XIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Props {
  placeholder?: string;
  onValueChange: (query: string) => void;
  showBarcode?: boolean;
  onBarcodePress?: () => void;
  className?: string;
}

export const DebounceSearchInput = ({
  placeholder = 'Buscar...',
  onValueChange,
  showBarcode = false,
  onBarcodePress,
  className,
}: Props) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onValueChange(query);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <View className={`relative justify-center ${className || ''}`}>
      <Input
        className="h-12 rounded-xl border-border/80 bg-secondary/50 pl-11 pr-11 text-base placeholder:text-muted-foreground"
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <View className="pointer-events-none absolute left-3.5 top-0 bottom-0 items-center justify-center">
        <Icon as={SearchIcon} size={18} className="text-muted-foreground" />
      </View>
      {query.length > 0 ? (
        <Button
          className="absolute right-1 top-1 bottom-1 h-10 w-10 items-center justify-center rounded-lg"
          size="icon"
          variant="ghost"
          accessibilityLabel="Limpiar búsqueda"
          onPress={() => setQuery('')}>
          <Icon as={XIcon} size={16} className="text-muted-foreground" />
        </Button>
      ) : showBarcode ? (
        <Button
          className="absolute right-1 top-1 bottom-1 h-10 w-10 items-center justify-center rounded-lg"
          size="icon"
          variant="ghost"
          accessibilityLabel="Escanear código de barras"
          onPress={onBarcodePress}>
          <Icon as={ScanBarcode} size={18} className="text-muted-foreground" />
        </Button>
      ) : null}
    </View>
  );
};
