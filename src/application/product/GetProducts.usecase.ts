import { IProductRepository, ProductFilters } from '../../domain/product/repositories/IProductRepository';

export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(filters: ProductFilters) {
    return this.productRepository.findAll(filters);
  }
}
