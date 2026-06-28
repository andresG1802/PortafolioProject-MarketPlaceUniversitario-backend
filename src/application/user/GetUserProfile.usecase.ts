import { IUserRepository } from '../../domain/user/repositories/IUserRepository';
import { NotFoundError } from '../../shared/errors/AppError';

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuario');
    return user.toPublic();
  }
}
