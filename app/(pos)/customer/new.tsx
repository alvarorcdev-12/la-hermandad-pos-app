import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert } from '@/components/ui/alert';
import { CustomerCreationError } from '@/actions/customers/customer-error';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Button } from '@/components/ui/button';

import {
  createCustomerAction,
  type CreateCustomerInput,
} from '@/actions/customers/create-customer.action';

import { useCartStore } from '@/presentation/stores/cart.store';

const NewCustomer = () => {
  const [alert, setAlert] = useState({ visible: false, message: '' });
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const {
    control,
    setError,
    clearErrors,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<CreateCustomerInput>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const setSelectedCustomer = useCartStore((state) => state.setSelectedCustomer);

  const mutation = useMutation({
    mutationFn: createCustomerAction,
  });

  const handleSave = (data: CreateCustomerInput) => {
    if (mutation.isPending) return;

    setAlert((current) => ({ ...current, visible: false }));
    clearErrors();
    mutation.mutate(data, {
      onError: (error) => {
        if (error instanceof CustomerCreationError) {
          for (const field of ['firstName', 'lastName', 'email', 'phone'] as const) {
            const message = error.fieldErrors[field];
            if (message) setError(field, { type: 'server', message });
          }
        }
        const message =
          error instanceof CustomerCreationError
            ? error.message
            : 'No se pudo crear el cliente. Intenta nuevamente.';
        if (message) {
          setAlert({ visible: true, message });
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
      },
      onSuccess: (customer) => {
        setSelectedCustomer({ id: customer.id, displayName: customer.displayName });
        router.replace('/(pos)/(tabs)/cart');
      },
    });
  };

  const renderSaveButton = () => (
    <Button
      size="sm"
      variant="ghost"
      onPress={handleSubmit(handleSave)}
      disabled={!isValid || mutation.isPending}>
      <Text className="text-primary">{mutation.isPending ? 'Guardando…' : 'Guardar'}</Text>
    </Button>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: renderSaveButton,
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'height' : undefined}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 16),
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}>
          <ThemedView className="px-4 dark:bg-card">
            <Text className="mb-4 mt-2 text-2xl font-semibold">Agregar cliente</Text>
            <Text className="mb-2 text-sm text-muted-foreground">Información de contacto</Text>
            <Alert
              visible={alert.visible}
              variant="error"
              title="No se pudo crear el cliente"
              message={alert.message}
              onClose={() => setAlert((current) => ({ ...current, visible: false }))}
            />
            <View className="gap-2">
              <View className="gap-2">
                <Label>Nombre</Label>
                <View className="gap-1">
                  <Controller
                    control={control}
                    name="firstName"
                    rules={{ validate: (value) => !!value.trim() || 'El nombre es requerido' }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input
                        autoCapitalize="words"
                        autoComplete="given-name"
                        autoCorrect={false}
                        accessibilityLabel="Nombre"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className={errors.firstName && 'border-destructive'}
                      />
                    )}
                  />
                  {errors.firstName && (
                    <Text className="text-xs text-destructive">{errors.firstName.message}</Text>
                  )}
                </View>
              </View>
              <View className="gap-2">
                <Label>Apellido</Label>
                <View className="gap-1">
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input
                        autoCapitalize="words"
                        autoComplete="family-name"
                        autoCorrect={false}
                        accessibilityLabel="Apellido"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className={errors.lastName && 'border-destructive'}
                      />
                    )}
                  />
                  {errors.lastName && (
                    <Text className="text-xs text-destructive">{errors.lastName.message}</Text>
                  )}
                </View>
              </View>
              <View className="gap-2">
                <Label>Correo electrónico</Label>
                <View className="gap-1">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect={false}
                        accessibilityLabel="Correo electrónico"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className={errors.email && 'border-destructive'}
                      />
                    )}
                  />
                  {errors.email && (
                    <Text className="text-xs text-destructive">{errors.email.message}</Text>
                  )}
                </View>
              </View>
              <View className="gap-2">
                <Label>Número de teléfono</Label>
                <View className="gap-1">
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoComplete="tel"
                        autoCorrect={false}
                        accessibilityLabel="Número de teléfono"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className={errors.phone && 'border-destructive'}
                      />
                    )}
                  />
                  {errors.phone && (
                    <Text className="text-xs text-destructive">{errors.phone.message}</Text>
                  )}
                </View>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default NewCustomer;
