import { Product } from '@/domain/entities/product.entity';
import { ProductDB } from '../interfaces/products-response.interface';

export class ProductMapper {
  static toEntity(productDB: ProductDB): Product {
    return productDB;
  }

  static toEntityList(productsDB: ProductDB[]): Product[] {
    return productsDB.map(this.toEntity);
  }
}
