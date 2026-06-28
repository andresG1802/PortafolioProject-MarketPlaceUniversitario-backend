import { DomainError } from '../../../shared/errors/AppError';

export interface ReviewProps {
  id?: number;
  reviewerId: number;
  reviewedId: number;
  productId?: number | null;
  rating: number;
  comment?: string | null;
  createdAt?: Date;
}

export class Review {
  readonly id?: number;
  readonly reviewerId: number;
  readonly reviewedId: number;
  readonly productId: number | null;
  readonly rating: number;
  readonly comment: string | null;
  readonly createdAt: Date;

  constructor(props: ReviewProps) {
    if (props.reviewerId === props.reviewedId) {
      throw new DomainError('No puedes calificarte a ti mismo');
    }
    if (!Number.isInteger(props.rating) || props.rating < 1 || props.rating > 5) {
      throw new DomainError('La calificación debe ser un entero entre 1 y 5');
    }

    this.id = props.id;
    this.reviewerId = props.reviewerId;
    this.reviewedId = props.reviewedId;
    this.productId = props.productId ?? null;
    this.rating = props.rating;
    this.comment = props.comment ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }
}
