import { DomainError } from '../../../shared/errors/AppError';

export interface MessageProps {
  id?: number;
  conversationId: number;
  senderId: number;
  content: string;
  read?: boolean;
  createdAt?: Date;
}

export class Message {
  readonly id?: number;
  readonly conversationId: number;
  readonly senderId: number;
  readonly content: string;
  readonly read: boolean;
  readonly createdAt: Date;

  constructor(props: MessageProps) {
    if (!props.content || props.content.trim().length === 0) {
      throw new DomainError('El mensaje no puede estar vacío');
    }
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.content = props.content.trim();
    this.read = props.read ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }
}
