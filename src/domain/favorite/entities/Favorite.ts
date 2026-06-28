export interface FavoriteProps {
  id?: number;
  userId: number;
  productId: number;
  createdAt?: Date;
}

export class Favorite {
  readonly id?: number;
  readonly userId: number;
  readonly productId: number;
  readonly createdAt: Date;

  constructor(props: FavoriteProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.productId = props.productId;
    this.createdAt = props.createdAt ?? new Date();
  }
}
