import { IUserRepository } from '../../domain/user/repositories/IUserRepository';
import { comparePassword } from '../../shared/utils/hash.util';
import { signToken } from '../../shared/utils/jwt.util';
import { UnauthorizedError } from '../../shared/errors/AppError';

export interface LoginDTO {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginDTO) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError('Credenciales inválidas');

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) throw new UnauthorizedError('Credenciales inválidas');

    const token = signToken({ userId: user.id!, email: user.email });
    return { user: user.toPublic(), token };
  }
}
