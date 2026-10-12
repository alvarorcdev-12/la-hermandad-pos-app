import { isAxiosError } from 'axios';

export function checkoutError(error: unknown): string {
  if (isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.every((part) => typeof part === 'string'))
      return message.join('\n');
    return 'No se pudo conectar con el servidor. Conservamos el pedido y sus pagos; revisa tu conexión.';
  }
  return error instanceof Error ? error.message : 'No se pudo guardar la operación.';
}
