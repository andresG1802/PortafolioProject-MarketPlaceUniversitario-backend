import { IUserRepository } from '../../domain/user/repositories/IUserRepository';
import { User } from '../../domain/user/entities/User';
import { hashPassword } from '../../shared/utils/hash.util';
import { signToken } from '../../shared/utils/jwt.util';
import { ConflictError } from '../../shared/errors/AppError';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  university?: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDTO) {
    const exists = await this.userRepository.findByEmail(dto.email);
    if (exists) throw new ConflictError('El email ya está registrado');

    const hashed = await hashPassword(dto.password);
    const user = new User({ ...dto, password: hashed });
    const saved = await this.userRepository.save(user);

    const token = signToken({ userId: saved.id!, email: saved.email });
    return { user: saved.toPublic(), token };
  }
}
