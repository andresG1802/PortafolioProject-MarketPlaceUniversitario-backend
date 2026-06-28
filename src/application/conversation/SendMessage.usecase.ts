import { IConversationRepository } from '../../domain/conversation/repositories/IConversationRepository';
import { Message } from '../../domain/conversation/entities/Message';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export interface SendMessageDTO {
  conversationId: number;
  senderId: number;
  content: string;
}

export class SendMessageUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(dto: SendMessageDTO): Promise<Message> {
    const conversation = await this.conversationRepository.findById(dto.conversationId);
    if (!conversation) throw new NotFoundError('Conversación');

    const isParticipant =
      conversation.buyerId === dto.senderId || conversation.sellerId === dto.senderId;
    if (!isParticipant) throw new ForbiddenError('No eres parte de esta conversación');

    const message = new Message(dto);
    const saved = await this.conversationRepository.saveMessage(message);
    await this.conversationRepository.updateLastMessage(dto.conversationId, dto.content);
    return saved;
  }
}
