import { DomainError } from '../../../shared/errors/AppError';

export class Price {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0) throw new DomainError('El precio no puede ser negativo');
    if (!Number.isFinite(value)) throw new DomainError('Precio inválido');
    this._value = Math.round(value * 100) / 100;
  }

  get value(): number { return this._value; }

  equals(other: Price): boolean {
    return this._value === other._value;
  }
}
