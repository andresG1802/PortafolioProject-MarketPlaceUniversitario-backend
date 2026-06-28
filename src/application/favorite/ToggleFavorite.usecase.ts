import { IFavoriteRepository } from '../../domain/favorite/repositories/IFavoriteRepository';
import { Favorite } from '../../domain/favorite/entities/Favorite';

export class ToggleFavoriteUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(userId: number, productId: number): Promise<{ added: boolean }> {
    const existing = await this.favoriteRepository.findOne(userId, productId);
    if (existing) {
      await this.favoriteRepository.delete(userId, productId);
      return { added: false };
    }
    const favorite = new Favorite({ userId, productId });
    await this.favoriteRepository.save(favorite);
    return { added: true };
  }
}
