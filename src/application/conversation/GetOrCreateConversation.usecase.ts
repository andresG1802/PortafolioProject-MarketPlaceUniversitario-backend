import { IConversationRepository } from '../../domain/conversation/repositories/IConversationRepository';
import { Conversation } from '../../domain/conversation/entities/Conversation';
import { DomainError } from '../../shared/errors/AppError';

export interface GetOrCreateConversationDTO {
  productId: number;
  buyerId: number;
  sellerId: number;
}

export class GetOrCreateConversationUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(dto: GetOrCreateConversationDTO): Promise<Conversation> {
    if (dto.buyerId === dto.sellerId) {
      throw new DomainError('No puedes iniciar un chat contigo mismo');
    }
    const existing = await this.conversationRepository.findByParticipants(
      dto.productId,
      dto.buyerId,
      dto.sellerId
    );
    if (existing) return existing;

    const conversation = new Conversation(dto);
    return this.conversationRepository.save(conversation);
  }
}
