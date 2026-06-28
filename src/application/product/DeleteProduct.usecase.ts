import { IProductRepository } from '../../domain/product/repositories/IProductRepository';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: number, requesterId: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError('Producto');
    if (product.sellerId !== requesterId) throw new ForbiddenError('Solo el vendedor puede eliminar este producto');
    await this.productRepository.delete(productId);
  }
}
