import { IProductRepository } from '../../domain/product/repositories/IProductRepository';
import { Product, CategoryType, ProductCondition } from '../../domain/product/entities/Product';

export interface CreateProductDTO {
  sellerId: number;
  title: string;
  description: string;
  price: number;
  category: CategoryType;
  condition?: ProductCondition;
  images?: string[];
  subject?: string;
  university?: string;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: CreateProductDTO): Promise<Product> {
    const product = new Product(dto);
    return this.productRepository.save(product);
  }
}
