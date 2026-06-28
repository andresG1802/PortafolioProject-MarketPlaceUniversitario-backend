import { pool } from '../connection';
import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { User } from '../../../domain/user/entities/User';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async save(user: User): Promise<User> {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, avatar_url, bio, university)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.name, user.email, user.password, user.avatarUrl, user.bio, user.university]
    );
    return this.toEntity(rows[0]);
  }

  async update(user: User): Promise<User> {
    const { rows } = await pool.query(
      `UPDATE users
       SET name = $1, avatar_url = $2, bio = $3, university = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [user.name, user.avatarUrl, user.bio, user.university, user.id]
    );
    return this.toEntity(rows[0]);
  }

  private toEntity(row: Record<string, unknown>): User {
    return new User({
      id: row.id as number,
      name: row.name as string,
      email: row.email as string,
      password: row.password as string,
      avatarUrl: row.avatar_url as string | null,
      bio: row.bio as string | null,
      university: row.university as string | null,
      reputationScore: parseFloat(row.reputation_score as string) || 0,
      totalReviews: row.total_reviews as number,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }
}
