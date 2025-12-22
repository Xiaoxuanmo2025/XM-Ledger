import { Currency } from '@/domain/entities';
import { ICurrencyExchangeService } from '@/use-cases/ports';

/**
 * Exchange Rate API Service
 *
 * 使用 exchangerate-api.com 的免费 API
 * 注册地址: https://www.exchangerate-api.com/
 *
 * 免费计划限制:
 * - 1500 requests/month
 * - 每日汇率数据
 *
 * 备选方案:
 * - https://fixer.io/ (需要注册)
 * - https://openexchangerates.org/ (有免费计划)
 */
export class ExchangeRateApiService implements ICurrencyExchangeService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { rate: number; timestamp: number }>;
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 小时

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
    this.baseUrl =
      process.env.EXCHANGE_RATE_API_URL ||
      'https://v6.exchangerate-api.com/v6';
    this.cache = new Map();
  }

  async getRate(
    date: Date,
    fromCurrency: Currency,
    toCurrency: Currency = Currency.CNY
  ): Promise<number | null> {
    // 如果是同一币种,返回 1
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // 检查缓存
    const cacheKey = this.getCacheKey(date, fromCurrency, toCurrency);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.rate;
    }

    // 如果没有 API Key,返回 null (需要手动输入)
    if (!this.apiKey) {
      console.warn('EXCHANGE_RATE_API_KEY not configured. Please set it in .env');
      return null;
    }

    try {
      // API 调用 (获取指定日期的汇率)
      // 注意: 免费版本可能不支持历史汇率,只能获取最新汇率
      const url = `${this.baseUrl}/${this.apiKey}/latest/${fromCurrency}`;

      const response = await fetch(url, {
        next: { revalidate: 86400 }, // Next.js 缓存 24 小时
      });

      if (!response.ok) {
        console.error(`Exchange rate API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.result !== 'success') {
        console.error('Exchange rate API returned error:', data);
        return null;
      }

      const rate = data.conversion_rates[toCurrency];

      if (!rate) {
        console.error(`Rate not found for ${fromCurrency} -> ${toCurrency}`);
        return null;
      }

      // 缓存结果
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now(),
      });

      return rate;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      return null;
    }
  }

  async getRates(
    date: Date,
    fromCurrencies: Currency[],
    toCurrency: Currency = Currency.CNY
  ): Promise<Map<Currency, number>> {
    const results = new Map<Currency, number>();

    // 并行获取多个汇率
    await Promise.all(
      fromCurrencies.map(async (fromCurrency) => {
        const rate = await this.getRate(date, fromCurrency, toCurrency);
        if (rate !== null) {
          results.set(fromCurrency, rate);
        }
      })
    );

    return results;
  }

  private getCacheKey(date: Date, from: Currency, to: Currency): string {
    const dateStr = date.toISOString().split('T')[0];
    return `${dateStr}-${from}-${to}`;
  }
}
