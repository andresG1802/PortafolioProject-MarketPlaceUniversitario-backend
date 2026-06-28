import { IUserRepository } from '../../domain/user/repositories/IUserRepository';
import { NotFoundError } from '../../shared/errors/AppError';

export interface UpdateProfileDTO {
  userId: number;
  name?: string;
  bio?: string;
  university?: string;
  avatarUrl?: string;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: UpdateProfileDTO) {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new NotFoundError('Usuario');

    const updated = user.updateProfile(dto);
    const saved = await this.userRepository.update(updated);
    return saved.toPublic();
  }
}
