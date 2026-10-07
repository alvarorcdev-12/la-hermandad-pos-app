import type { Customer } from '@/domain/entities/customer.entity';
import type { CustomerDB } from '../interfaces/customers-response.interface';

export class CustomerMapper {
  static toEntity(CustomerDB: CustomerDB): Customer {
    return {
      id: CustomerDB.id,
      displayName: CustomerDB.displayName,
      firstName: CustomerDB.firstName,
      lastName: CustomerDB.lastName,
      email: CustomerDB.email,
      phone: CustomerDB.phone,
      note: CustomerDB.note,
      amountSpent: CustomerDB.amountSpent,
      lastOrder: CustomerDB.lastOrder,
      numberOfOrders: CustomerDB.numberOfOrders,
      canDelete: CustomerDB.canDelete,
      createdAt: CustomerDB.createdAt,
    };
  }

  static toEntityList(customersDB: CustomerDB[]): Customer[] {
    return customersDB.map(this.toEntity);
  }
}
