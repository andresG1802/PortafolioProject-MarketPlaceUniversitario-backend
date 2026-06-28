import { Product, CategoryType, ProductStatus } from '../entities/Product';

export interface ProductFilters {
  category?: CategoryType;
  status?: ProductStatus;
  sellerId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findAll(filters: ProductFilters): Promise<{ products: Product[]; total: number }>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: number): Promise<void>;
  incrementViews(id: number): Promise<void>;
}
