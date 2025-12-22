/**
 * Domain Layer Errors
 *
 * 定义业务领域内的错误类型
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidTransactionError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTransactionError';
  }
}

export class ExchangeRateNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ExchangeRateNotFoundError';
  }
}

export class CategoryNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryNotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
