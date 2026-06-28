import { Favorite } from '../entities/Favorite';

export interface IFavoriteRepository {
  findByUser(userId: number): Promise<Favorite[]>;
  findOne(userId: number, productId: number): Promise<Favorite | null>;
  save(favorite: Favorite): Promise<Favorite>;
  delete(userId: number, productId: number): Promise<void>;
}
