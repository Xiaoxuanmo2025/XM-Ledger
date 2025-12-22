import { Currency } from '@/domain/entities';
import { ICurrencyExchangeService } from '@/use-cases/ports';

/**
 * Mock Exchange Rate Service
 *
 * 用于开发和测试环境的 Mock 汇率服务
 * 提供固定的模拟汇率数据
 */
export class MockExchangeRateService implements ICurrencyExchangeService {
  // 模拟汇率 (相对于 CNY)
  private mockRates: Record<Currency, number> = {
    [Currency.CNY]: 1,
    [Currency.USD]: 7.2, // 1 USD = 7.2 CNY
    [Currency.JPY]: 0.05, // 1 JPY = 0.05 CNY
  };

  async getRate(
    date: Date,
    fromCurrency: Currency,
    toCurrency: Currency = Currency.CNY
  ): Promise<number | null> {
    console.log(
      `[MockExchangeRateService] Getting rate for ${fromCurrency} -> ${toCurrency} on ${date.toISOString()}`
    );

    if (fromCurrency === toCurrency) {
      return 1;
    }

    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 100));

    return this.mockRates[fromCurrency] ?? null;
  }

  async getRates(
    date: Date,
    fromCurrencies: Currency[],
    toCurrency: Currency = Currency.CNY
  ): Promise<Map<Currency, number>> {
    const results = new Map<Currency, number>();

    for (const currency of fromCurrencies) {
      const rate = await this.getRate(date, currency, toCurrency);
      if (rate !== null) {
        results.set(currency, rate);
      }
    }

    return results;
  }
}
