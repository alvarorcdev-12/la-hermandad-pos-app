import { customerCreationError } from './customer-error';
import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';

import { CustomerMapper } from '@/infrastructure/mappers/customer.mapper';

import type { Customer } from '@/domain/entities/customer.entity';
import type { CustomerDB } from '@/infrastructure/interfaces/customers-response.interface';

export interface CreateCustomerInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const createCustomerAction = async (
  customerForm: CreateCustomerInput
): Promise<Customer> => {
  const firstName = customerForm.firstName.trim();
  const lastName = customerForm.lastName?.trim();
  const email = customerForm.email?.trim();
  const phone = customerForm.phone?.trim();

  // Los campos opcionales vacíos deben omitirse para no activar sus validadores.
  const payload: CreateCustomerInput = {
    firstName,
    ...(lastName ? { lastName } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  };

  try {
    const { data } = await laHermandadApi.post<CustomerDB>('/customers', payload);
    return CustomerMapper.toEntity(data);
  } catch (error) {
    throw customerCreationError(error);
  }
};
