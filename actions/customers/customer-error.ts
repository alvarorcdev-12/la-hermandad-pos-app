import { isAxiosError } from 'axios';

export type CustomerField = 'firstName' | 'lastName' | 'email' | 'phone';
export type CustomerFieldErrors = Partial<Record<CustomerField, string>>;

const fallback = 'No se pudo crear el cliente. Intenta nuevamente.';

// Solo exponemos mensajes revisados; nunca respuestas arbitrarias del servidor.
const publicMessages: Record<string, string> = {
  'El cliente ya existe.': 'El cliente ya existe.',
  'El correo electrónico ya está registrado.': 'El correo electrónico ya está registrado.',
  'El teléfono ya está registrado.': 'El teléfono ya está registrado.',
};
const validationMessages: Record<string, { field: CustomerField; message: string }> = {
  'firstName should not be empty': { field: 'firstName', message: 'El nombre es requerido.' },
  'email must be an email': { field: 'email', message: 'Ingresa un correo electrónico válido.' },
  'phone must be a valid phone number': {
    field: 'phone',
    message: 'Ingresa un número de teléfono válido.',
  },
};

export class CustomerCreationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: CustomerFieldErrors,
    cause: unknown
  ) {
    super(message, { cause });
    this.name = 'CustomerCreationError';
  }
}

export function customerCreationError(error: unknown): CustomerCreationError {
  const fieldErrors: CustomerFieldErrors = {};
  if (!isAxiosError<unknown>(error)) return new CustomerCreationError(fallback, fieldErrors, error);
  if (!error.response) {
    return new CustomerCreationError(
      'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.',
      fieldErrors,
      error
    );
  }
  const { status, data } = error.response;
  if (
    ![400, 409, 422].includes(status) ||
    !data ||
    typeof data !== 'object' ||
    !('message' in data)
  ) {
    return new CustomerCreationError(fallback, fieldErrors, error);
  }
  const messages = Array.isArray(data.message) ? data.message : [data.message];
  const general: string[] = [];
  for (const message of messages) {
    const validation =
      typeof message === 'string' && Object.hasOwn(validationMessages, message)
        ? validationMessages[message]
        : undefined;
    if (validation) {
      fieldErrors[validation.field] = validation.message;
    } else {
      general.push(
        typeof message === 'string' && Object.hasOwn(publicMessages, message)
          ? publicMessages[message]
          : fallback
      );
    }
  }
  return new CustomerCreationError(
    [...new Set(general)].join('\n') || (Object.keys(fieldErrors).length ? '' : fallback),
    fieldErrors,
    error
  );
}
