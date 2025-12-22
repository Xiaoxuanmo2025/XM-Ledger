/**
 * Repository Interfaces (Ports)
 *
 * 这些接口定义了 Use Case 层所需的数据访问能力
 * 遵循 Dependency Inversion Principle
 */

export * from './ITransactionRepository';
export * from './ICategoryRepository';
export * from './IExchangeRateRepository';
export * from './ICurrencyExchangeService';
