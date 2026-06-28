export interface ConversationProps {
  id?: number;
  productId?: number | null;
  buyerId: number;
  sellerId: number;
  lastMessage?: string | null;
  lastMessageAt?: Date | null;
  createdAt?: Date;
}

export class Conversation {
  readonly id?: number;
  readonly productId: number | null;
  readonly buyerId: number;
  readonly sellerId: number;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  readonly createdAt: Date;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.productId = props.productId ?? null;
    this.buyerId = props.buyerId;
    this.sellerId = props.sellerId;
    this.lastMessage = props.lastMessage ?? null;
    this.lastMessageAt = props.lastMessageAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }
}
