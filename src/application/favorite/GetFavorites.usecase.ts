import { IFavoriteRepository } from '../../domain/favorite/repositories/IFavoriteRepository';

export class GetFavoritesUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(userId: number) {
    return this.favoriteRepository.findByUser(userId);
  }
}
