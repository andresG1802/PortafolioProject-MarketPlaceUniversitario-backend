import { IProductRepository } from '../../domain/product/repositories/IProductRepository';
import { NotFoundError } from '../../shared/errors/AppError';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Producto');
    await this.productRepository.incrementViews(id);
    return product;
  }
}
