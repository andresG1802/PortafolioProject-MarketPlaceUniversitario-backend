import { Price } from '../value-objects/Price';
import { DomainError } from '../../../shared/errors/AppError';

export type CategoryType = 'apuntes' | 'laptops' | 'accesorios';
export type ProductCondition = 'nuevo' | 'como_nuevo' | 'bueno' | 'aceptable';
export type ProductStatus = 'disponible' | 'vendido' | 'pausado';

export interface ProductProps {
  id?: number;
  sellerId: number;
  title: string;
  description: string;
  price: number;
  category: CategoryType;
  condition?: ProductCondition | null;
  status?: ProductStatus;
  images?: string[];
  subject?: string | null;
  university?: string | null;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  readonly id?: number;
  readonly sellerId: number;
  private _title: string;
  private _description: string;
  private _price: Price;
  readonly category: CategoryType;
  readonly condition: ProductCondition | null;
  private _status: ProductStatus;
  readonly images: string[];
  readonly subject: string | null;
  readonly university: string | null;
  readonly views: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private static readonly VALID_CATEGORIES: CategoryType[] = ['apuntes', 'laptops', 'accesorios'];

  constructor(props: ProductProps) {
    if (!props.title || props.title.trim().length < 3) {
      throw new DomainError('El título debe tener al menos 3 caracteres');
    }
    if (!props.description || props.description.trim().length < 10) {
      throw new DomainError('La descripción debe tener al menos 10 caracteres');
    }
    if (!Product.VALID_CATEGORIES.includes(props.category)) {
      throw new DomainError(`Categoría inválida: ${props.category}`);
    }

    this.id = props.id;
    this.sellerId = props.sellerId;
    this._title = props.title.trim();
    this._description = props.description.trim();
    this._price = new Price(props.price);
    this.category = props.category;
    this.condition = props.condition ?? null;
    this._status = props.status ?? 'disponible';
    this.images = props.images ?? [];
    this.subject = props.subject ?? null;
    this.university = props.university ?? null;
    this.views = props.views ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get price(): number { return this._price.value; }
  get status(): ProductStatus { return this._status; }

  markAsSold(): Product {
    return new Product({ ...this.toPlain(), status: 'vendido' });
  }

  pause(): Product {
    return new Product({ ...this.toPlain(), status: 'pausado' });
  }

  reactivate(): Product {
    return new Product({ ...this.toPlain(), status: 'disponible' });
  }

  toPlain(): ProductProps {
    return {
      id: this.id,
      sellerId: this.sellerId,
      title: this._title,
      description: this._description,
      price: this._price.value,
      category: this.category,
      condition: this.condition,
      status: this._status,
      images: this.images,
      subject: this.subject,
      university: this.university,
      views: this.views,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
