import { IProductRepository } from '../../domain/product/repositories/IProductRepository';
import { ProductStatus } from '../../domain/product/entities/Product';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export interface UpdateStatusDTO {
  productId: number;
  requesterId: number;
  status: ProductStatus;
}

export class UpdateProductStatusUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: UpdateStatusDTO) {
    const product = await this.productRepository.findById(dto.productId);
    if (!product) throw new NotFoundError('Producto');
    if (product.sellerId !== dto.requesterId) throw new ForbiddenError('Solo el vendedor puede modificar este producto');

    let updated = product;
    if (dto.status === 'vendido') updated = product.markAsSold();
    else if (dto.status === 'pausado') updated = product.pause();
    else if (dto.status === 'disponible') updated = product.reactivate();

    return this.productRepository.update(updated);
  }
}
