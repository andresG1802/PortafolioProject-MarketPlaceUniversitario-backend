import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';

export interface IConversationRepository {
  findById(id: number): Promise<Conversation | null>;
  findByParticipants(productId: number, buyerId: number, sellerId: number): Promise<Conversation | null>;
  findByUserId(userId: number): Promise<Conversation[]>;
  save(conversation: Conversation): Promise<Conversation>;
  updateLastMessage(conversationId: number, lastMessage: string): Promise<void>;

  findMessages(conversationId: number): Promise<Message[]>;
  saveMessage(message: Message): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
}
