/**
 * Domain Entity: 支持的货币类型
 * 纯业务领域定义,不依赖任何框架
 */
export enum Currency {
  USD = 'USD',
  JPY = 'JPY',
  CNY = 'CNY',
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.JPY]: '¥',
  [Currency.CNY]: '¥',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  [Currency.USD]: 'US Dollar',
  [Currency.JPY]: 'Japanese Yen',
  [Currency.CNY]: 'Chinese Yuan',
};
