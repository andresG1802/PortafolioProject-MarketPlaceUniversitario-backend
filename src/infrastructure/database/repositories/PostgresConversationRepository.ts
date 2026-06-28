import { pool } from '../connection';
import { IConversationRepository } from '../../../domain/conversation/repositories/IConversationRepository';
import { Conversation } from '../../../domain/conversation/entities/Conversation';
import { Message } from '../../../domain/conversation/entities/Message';

export class PostgresConversationRepository implements IConversationRepository {
  async findById(id: number): Promise<Conversation | null> {
    const { rows } = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    return rows[0] ? this.toConvEntity(rows[0]) : null;
  }

  async findByParticipants(productId: number, buyerId: number, sellerId: number): Promise<Conversation | null> {
    const { rows } = await pool.query(
      'SELECT * FROM conversations WHERE product_id = $1 AND buyer_id = $2 AND seller_id = $3',
      [productId, buyerId, sellerId]
    );
    return rows[0] ? this.toConvEntity(rows[0]) : null;
  }

  async findByUserId(userId: number): Promise<Conversation[]> {
    const { rows } = await pool.query(
      `SELECT c.*,
        buyer.name  as buyer_name,  buyer.avatar_url  as buyer_avatar,
        seller.name as seller_name, seller.avatar_url as seller_avatar,
        p.title as product_title, p.images[1] as product_image
       FROM conversations c
       JOIN users buyer  ON buyer.id  = c.buyer_id
       JOIN users seller ON seller.id = c.seller_id
       LEFT JOIN products p ON p.id = c.product_id
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST`,
      [userId]
    );
    return rows.map((r) => {
      const conv = this.toConvEntity(r);
      (conv as unknown as Record<string, unknown>).buyerName = r.buyer_name;
      (conv as unknown as Record<string, unknown>).buyerAvatar = r.buyer_avatar;
      (conv as unknown as Record<string, unknown>).sellerName = r.seller_name;
      (conv as unknown as Record<string, unknown>).sellerAvatar = r.seller_avatar;
      (conv as unknown as Record<string, unknown>).productTitle = r.product_title;
      (conv as unknown as Record<string, unknown>).productImage = r.product_image;
      return conv;
    });
  }

  async save(conversation: Conversation): Promise<Conversation> {
    const { rows } = await pool.query(
      `INSERT INTO conversations (product_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, buyer_id, seller_id) DO UPDATE SET product_id = EXCLUDED.product_id
       RETURNING *`,
      [conversation.productId, conversation.buyerId, conversation.sellerId]
    );
    return this.toConvEntity(rows[0]);
  }

  async updateLastMessage(conversationId: number, lastMessage: string): Promise<void> {
    await pool.query(
      'UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2',
      [lastMessage, conversationId]
    );
  }

  async findMessages(conversationId: number): Promise<Message[]> {
    const { rows } = await pool.query(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1 ORDER BY m.created_at ASC`,
      [conversationId]
    );
    return rows.map((r) => {
      const msg = this.toMsgEntity(r);
      (msg as unknown as Record<string, unknown>).senderName = r.sender_name;
      (msg as unknown as Record<string, unknown>).senderAvatar = r.sender_avatar;
      return msg;
    });
  }

  async saveMessage(message: Message): Promise<Message> {
    const { rows } = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [message.conversationId, message.senderId, message.content]
    );
    return this.toMsgEntity(rows[0]);
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await pool.query(
      'UPDATE messages SET read = TRUE WHERE conversation_id = $1 AND sender_id != $2',
      [conversationId, userId]
    );
  }

  private toConvEntity(row: Record<string, unknown>): Conversation {
    return new Conversation({
      id: row.id as number,
      productId: row.product_id as number | null,
      buyerId: row.buyer_id as number,
      sellerId: row.seller_id as number,
      lastMessage: row.last_message as string | null,
      lastMessageAt: row.last_message_at as Date | null,
      createdAt: row.created_at as Date,
    });
  }

  private toMsgEntity(row: Record<string, unknown>): Message {
    return new Message({
      id: row.id as number,
      conversationId: row.conversation_id as number,
      senderId: row.sender_id as number,
      content: row.content as string,
      read: row.read as boolean,
      createdAt: row.created_at as Date,
    });
  }
}
