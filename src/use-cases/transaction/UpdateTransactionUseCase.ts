import Decimal from 'decimal.js';
import {
  Transaction,
  CreateTransactionInput,
  Currency,
} from '@/domain/entities';
import {
  InvalidTransactionError,
  ExchangeRateNotFoundError,
} from '@/domain/errors/DomainError';
import {
  ITransactionRepository,
  ICategoryRepository,
  IExchangeRateRepository,
  ICurrencyExchangeService,
} from '../ports';

/**
 * Update Transaction Use Case
 *
 * 更新交易时需要重新计算汇率和 CNY 金额
 */
export class UpdateTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private categoryRepo: ICategoryRepository,
    private exchangeRateRepo: IExchangeRateRepository,
    private currencyService: ICurrencyExchangeService
  ) {}

  async execute(
    id: string,
    userId: string,
    data: Partial<CreateTransactionInput>
  ): Promise<Transaction> {
    // 1. 检查交易是否存在
    const existing = await this.transactionRepo.findById(id);
    if (!existing) {
      throw new InvalidTransactionError('交易不存在');
    }

    // 2. 验证权限
    if (existing.userId !== userId) {
      throw new InvalidTransactionError('无权修改此交易');
    }

    // 3. 如果修改了金额、币种或日期,需要重新计算汇率
    const needsRecalculation =
      data.originalAmount !== undefined ||
      data.currency !== undefined ||
      data.date !== undefined;

    if (needsRecalculation) {
      const currency = data.currency ?? existing.currency;
      const date = data.date ?? existing.date;
      const originalAmount = data.originalAmount ?? existing.originalAmount;

      // 重新获取汇率
      const exchangeRate = await this.getExchangeRate(
        currency,
        date,
        data.exchangeRate
      );

      // 更新时包含重新计算的汇率
      return this.transactionRepo.update(id, {
        ...data,
        exchangeRate,
      });
    }

    // 4. 如果只是修改描述、备注等,直接更新
    return this.transactionRepo.update(id, data);
  }

  private async getExchangeRate(
    currency: Currency,
    date: Date,
    providedRate?: number | string | Decimal
  ): Promise<Decimal> {
    if (currency === Currency.CNY) {
      return new Decimal(1);
    }

    if (providedRate !== undefined) {
      // Treat empty string as not provided
      if (typeof providedRate === 'string' && providedRate.trim() === '') {
        // fallthrough to auto fetch
      } else {
        try {
          return new Decimal(providedRate as any);
        } catch (err) {
          throw new InvalidTransactionError('提供的汇率无效');
        }
      }
    }

    // 尝试从缓存获取
    const cachedRate = await this.exchangeRateRepo.findByDateAndCurrency({
      date,
      fromCurrency: currency,
      toCurrency: Currency.CNY,
    });

    if (cachedRate) {
      return new Decimal(cachedRate.rate.toString());
    }

    // 调用外部服务
    const rate = await this.currencyService.getRate(date, currency, Currency.CNY);

    if (!rate) {
      throw new ExchangeRateNotFoundError(
        `无法获取 ${currency} 到 CNY 在 ${date.toISOString().split('T')[0]} 的汇率`
      );
    }

    // 缓存汇率
    await this.exchangeRateRepo.upsert({
      date,
      fromCurrency: currency,
      toCurrency: Currency.CNY,
      rate,
      source: 'auto',
    });

    return new Decimal(rate);
  }
}
