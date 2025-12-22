import { Currency } from '@/domain/entities';

/**
 * Currency Exchange Service Interface (Port)
 *
 * 定义获取汇率的外部服务接口
 * 具体实现可以使用不同的汇率 API
 */
export interface ICurrencyExchangeService {
  /**
   * 获取指定日期的汇率
   * @param date - 日期
   * @param fromCurrency - 源币种
   * @param toCurrency - 目标币种 (默认 CNY)
   * @returns 汇率,如果无法获取则返回 null
   */
  getRate(
    date: Date,
    fromCurrency: Currency,
    toCurrency?: Currency
  ): Promise<number | null>;

  /**
   * 批量获取汇率
   */
  getRates(
    date: Date,
    fromCurrencies: Currency[],
    toCurrency?: Currency
  ): Promise<Map<Currency, number>>;
}
