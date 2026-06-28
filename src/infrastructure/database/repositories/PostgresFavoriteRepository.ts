import { pool } from '../connection';
import { IFavoriteRepository } from '../../../domain/favorite/repositories/IFavoriteRepository';
import { Favorite } from '../../../domain/favorite/entities/Favorite';

export class PostgresFavoriteRepository implements IFavoriteRepository {
  async findByUser(userId: number): Promise<Favorite[]> {
    const { rows } = await pool.query(
      `SELECT f.*, p.title, p.price, p.images[1] as image, p.category, p.status,
              u.name as seller_name
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       JOIN users u ON u.id = p.seller_id
       WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows.map((r) => {
      const fav = new Favorite({
        id: r.id as number,
        userId: r.user_id as number,
        productId: r.product_id as number,
        createdAt: r.created_at as Date,
      });
      Object.assign(fav, {
        productTitle: r.title,
        productPrice: r.price,
        productImage: r.image,
        productCategory: r.category,
        productStatus: r.status,
        sellerName: r.seller_name,
      });
      return fav;
    });
  }

  async findOne(userId: number, productId: number): Promise<Favorite | null> {
    const { rows } = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return rows[0]
      ? new Favorite({ id: rows[0].id, userId: rows[0].user_id, productId: rows[0].product_id, createdAt: rows[0].created_at })
      : null;
  }

  async save(favorite: Favorite): Promise<Favorite> {
    const { rows } = await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [favorite.userId, favorite.productId]
    );
    return new Favorite({ id: rows[0].id, userId: rows[0].user_id, productId: rows[0].product_id, createdAt: rows[0].created_at });
  }

  async delete(userId: number, productId: number): Promise<void> {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
  }
}
