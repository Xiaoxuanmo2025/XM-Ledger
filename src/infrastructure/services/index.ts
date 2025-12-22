/**
 * External Services
 */

export * from './ExchangeRateApiService';
export * from './MockExchangeRateService';

/**
 * 工厂函数: 根据环境创建汇率服务实例
 */
import { ExchangeRateApiService } from './ExchangeRateApiService';
import { MockExchangeRateService } from './MockExchangeRateService';
import { ICurrencyExchangeService } from '@/use-cases/ports';

export function createExchangeRateService(): ICurrencyExchangeService {
  // 如果配置了 API Key,使用真实 API
  if (process.env.EXCHANGE_RATE_API_KEY) {
    return new ExchangeRateApiService();
  }

  // 否则使用 Mock 服务 (开发环境)
  console.warn(
    '[ExchangeRateService] Using Mock service. Set EXCHANGE_RATE_API_KEY for real data.'
  );
  return new MockExchangeRateService();
}
