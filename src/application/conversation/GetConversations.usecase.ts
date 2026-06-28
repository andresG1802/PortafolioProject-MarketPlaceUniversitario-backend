import { IConversationRepository } from '../../domain/conversation/repositories/IConversationRepository';

export class GetConversationsUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(userId: number) {
    return this.conversationRepository.findByUserId(userId);
  }
}
