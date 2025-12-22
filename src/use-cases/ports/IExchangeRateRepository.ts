import { ExchangeRate, GetExchangeRateQuery, Currency } from '@/domain/entities';

/**
 * ExchangeRate Repository Interface (Port)
 */
export interface IExchangeRateRepository {
  /**
   * 创建或更新汇率记录
   */
  upsert(data: {
    date: Date;
    fromCurrency: Currency;
    toCurrency: Currency;
    rate: number;
    source?: string;
  }): Promise<ExchangeRate>;

  /**
   * 查找指定日期和币种的汇率
   */
  findByDateAndCurrency(query: GetExchangeRateQuery): Promise<ExchangeRate | null>;

  /**
   * 批量查找汇率 (用于优化查询)
   */
  findMany(queries: GetExchangeRateQuery[]): Promise<ExchangeRate[]>;
}
