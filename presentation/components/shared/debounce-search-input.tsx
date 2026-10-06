import { View } from 'react-native';

import { SearchIcon, XIcon } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface Props {
  placeholder?: string;
  onValueChange: (query: string) => void;
}

export const DebounceSearchInput = ({ placeholder = 'Buscar...', onValueChange }: Props) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onValueChange(query);
    }, 600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <View className="relative">
      <Input
        className="pl-10 pr-10"
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <Button className="absolute left-0" size="icon" variant="ghost">
        <Icon as={SearchIcon} size={18} className="text-muted-foreground" />
      </Button>
      {query.length > 0 && (
        <Button
          className="absolute right-0"
          size="icon"
          variant="ghost"
          onPress={() => setQuery('')}>
          <Icon as={XIcon} size={16} className="text-muted-foreground" />
        </Button>
      )}
    </View>
  );
};
