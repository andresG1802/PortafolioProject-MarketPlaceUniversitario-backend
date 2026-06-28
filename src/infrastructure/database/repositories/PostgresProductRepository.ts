import { pool } from '../connection';
import { IProductRepository, ProductFilters } from '../../../domain/product/repositories/IProductRepository';
import { Product } from '../../../domain/product/entities/Product';

export class PostgresProductRepository implements IProductRepository {
  async findById(id: number): Promise<Product | null> {
    const { rows } = await pool.query(
      `SELECT p.*, u.name as seller_name, u.avatar_url as seller_avatar, u.reputation_score as seller_reputation
       FROM products p JOIN users u ON u.id = p.seller_id WHERE p.id = $1`,
      [id]
    );
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findAll(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
    const conditions: string[] = ['p.status = $1'];
    const values: unknown[] = [filters.status ?? 'disponible'];
    let idx = 2;

    if (filters.category) { conditions.push(`p.category = $${idx++}`); values.push(filters.category); }
    if (filters.sellerId) { conditions.push(`p.seller_id = $${idx++}`); values.push(filters.sellerId); }
    if (filters.search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }
    if (filters.minPrice !== undefined) { conditions.push(`p.price >= $${idx++}`); values.push(filters.minPrice); }
    if (filters.maxPrice !== undefined) { conditions.push(`p.price <= $${idx++}`); values.push(filters.maxPrice); }

    const where = conditions.join(' AND ');
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const countQuery = `SELECT COUNT(*) FROM products p WHERE ${where}`;
    const dataQuery = `
      SELECT p.*, u.name as seller_name, u.avatar_url as seller_avatar, u.reputation_score as seller_reputation
      FROM products p JOIN users u ON u.id = p.seller_id
      WHERE ${where} ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, values),
      pool.query(dataQuery, [...values, limit, offset]),
    ]);

    return {
      products: dataResult.rows.map((r) => this.toEntity(r)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async save(product: Product): Promise<Product> {
    const p = product.toPlain();
    const { rows } = await pool.query(
      `INSERT INTO products (seller_id, title, description, price, category, condition, images, subject, university)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [p.sellerId, p.title, p.description, p.price, p.category, p.condition, p.images, p.subject, p.university]
    );
    return this.toEntity(rows[0]);
  }

  async update(product: Product): Promise<Product> {
    const p = product.toPlain();
    const { rows } = await pool.query(
      `UPDATE products
       SET title=$1, description=$2, price=$3, status=$4, images=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [p.title, p.description, p.price, p.status, p.images, p.id]
    );
    return this.toEntity(rows[0]);
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }

  async incrementViews(id: number): Promise<void> {
    await pool.query('UPDATE products SET views = views + 1 WHERE id = $1', [id]);
  }

  private toEntity(row: Record<string, unknown>): Product {
    const p = new Product({
      id: row.id as number,
      sellerId: row.seller_id as number,
      title: row.title as string,
      description: row.description as string,
      price: parseFloat(row.price as string),
      category: row.category as 'apuntes' | 'laptops' | 'accesorios',
      condition: row.condition as 'nuevo' | 'como_nuevo' | 'bueno' | 'aceptable' | null,
      status: row.status as 'disponible' | 'vendido' | 'pausado',
      images: (row.images as string[]) ?? [],
      subject: row.subject as string | null,
      university: row.university as string | null,
      views: row.views as number,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
    // Attach seller info (read-only extra data)
    (p as unknown as Record<string, unknown>).sellerName = row.seller_name;
    (p as unknown as Record<string, unknown>).sellerAvatar = row.seller_avatar;
    (p as unknown as Record<string, unknown>).sellerReputation = row.seller_reputation;
    return p;
  }
}
