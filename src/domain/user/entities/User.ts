import { Email } from '../value-objects/Email';
import { DomainError } from '../../../shared/errors/AppError';

export interface UserProps {
  id?: number;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
  bio?: string | null;
  university?: string | null;
  reputationScore?: number;
  totalReviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id?: number;
  private _name: string;
  private _email: Email;
  private _password: string;
  private _avatarUrl: string | null;
  private _bio: string | null;
  private _university: string | null;
  readonly reputationScore: number;
  readonly totalReviews: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.name || props.name.trim().length < 2) {
      throw new DomainError('El nombre debe tener al menos 2 caracteres');
    }
    this.id = props.id;
    this._name = props.name.trim();
    this._email = new Email(props.email);
    this._password = props.password;
    this._avatarUrl = props.avatarUrl ?? null;
    this._bio = props.bio ?? null;
    this._university = props.university ?? null;
    this.reputationScore = props.reputationScore ?? 0;
    this.totalReviews = props.totalReviews ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get name(): string { return this._name; }
  get email(): string { return this._email.value; }
  get password(): string { return this._password; }
  get avatarUrl(): string | null { return this._avatarUrl; }
  get bio(): string | null { return this._bio; }
  get university(): string | null { return this._university; }

  updateProfile(data: { name?: string; bio?: string; university?: string; avatarUrl?: string }): User {
    return new User({
      id: this.id,
      name: data.name ?? this._name,
      email: this._email.value,
      password: this._password,
      avatarUrl: data.avatarUrl ?? this._avatarUrl ?? undefined,
      bio: data.bio ?? this._bio ?? undefined,
      university: data.university ?? this._university ?? undefined,
      reputationScore: this.reputationScore,
      totalReviews: this.totalReviews,
      createdAt: this.createdAt,
    });
  }

  toPublic() {
    return {
      id: this.id,
      name: this._name,
      email: this._email.value,
      avatarUrl: this._avatarUrl,
      bio: this._bio,
      university: this._university,
      reputationScore: this.reputationScore,
      totalReviews: this.totalReviews,
      createdAt: this.createdAt,
    };
  }
}
