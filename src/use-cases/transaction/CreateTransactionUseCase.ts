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
 * Create Transaction Use Case
 *
 * 核心业务逻辑:
 * 1. 验证交易数据 (金额必须大于0,分类必须存在)
 * 2. 处理汇率转换:
 *    - 如果币种是 CNY,汇率为 1
 *    - 如果用户提供了汇率,直接使用
 *    - 否则,尝试从缓存获取汇率
 *    - 如果缓存没有,调用外部 API 获取并缓存
 * 3. 计算 amountCNY = originalAmount * exchangeRate
 * 4. 创建交易记录
 */
export class CreateTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private categoryRepo: ICategoryRepository,
    private exchangeRateRepo: IExchangeRateRepository,
    private currencyService: ICurrencyExchangeService
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    // 1. 验证输入
    await this.validate(input);

    // 2. 获取或计算汇率
    const exchangeRate = await this.getExchangeRate(input);

    // 3. 计算 CNY 金额
    const originalAmount = new Decimal(input.originalAmount);
    const amountCNY = originalAmount.mul(exchangeRate);

    // 4. 创建交易
    const transaction = await this.transactionRepo.create({
      ...input,
      originalAmount,
      exchangeRate,
    });

    return transaction;
  }

  /**
   * 验证交易数据
   */
  private async validate(input: CreateTransactionInput): Promise<void> {
    // 验证金额
    const amount = new Decimal(input.originalAmount);
    if (amount.lte(0)) {
      throw new InvalidTransactionError('交易金额必须大于 0');
    }

    // 验证分类是否存在
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new InvalidTransactionError(`分类 ${input.categoryId} 不存在`);
    }

    // 验证分类类型与交易类型是否匹配
    if (category.type !== input.type) {
      throw new InvalidTransactionError(
        `分类类型不匹配: 分类是 ${category.type},交易是 ${input.type}`
      );
    }

    // 验证分类是否属于该用户
    if (category.userId !== input.userId) {
      throw new InvalidTransactionError('无权使用此分类');
    }
  }

  /**
   * 获取汇率
   *
   * 优先级:
   * 1. 如果币种是 CNY,返回 1
   * 2. 如果用户提供了汇率,直接使用
   * 3. 尝试从数据库缓存获取
   * 4. 调用外部 API 获取并缓存
   */
  private async getExchangeRate(
    input: CreateTransactionInput
  ): Promise<Decimal> {
    // 如果已经是 CNY,汇率为 1
    if (input.currency === Currency.CNY) {
      return new Decimal(1);
    }

    // 如果用户手动提供了汇率,进行校验后使用
    if (input.exchangeRate !== undefined) {
      // 处理空字符串或只包含空白的情况（认为未提供）
      if (typeof input.exchangeRate === 'string' && input.exchangeRate.trim() === '') {
        // 当用户在表单中留空时，我们不把空字符串当作有效汇率
      } else {
        try {
          return new Decimal(input.exchangeRate as any);
        } catch (err) {
          throw new InvalidTransactionError('提供的汇率无效');
        }
      }
    }

    // 尝试从缓存获取
    const cachedRate = await this.exchangeRateRepo.findByDateAndCurrency({
      date: input.date,
      fromCurrency: input.currency,
      toCurrency: Currency.CNY,
    });

    if (cachedRate) {
      return new Decimal(cachedRate.rate.toString());
    }

    // 调用外部服务获取汇率
    const rate = await this.currencyService.getRate(
      input.date,
      input.currency,
      Currency.CNY
    );

    if (!rate) {
      throw new ExchangeRateNotFoundError(
        `无法获取 ${input.currency} 到 CNY 在 ${input.date.toISOString().split('T')[0]} 的汇率。` +
        '请手动提供汇率。'
      );
    }

    // 缓存汇率
    await this.exchangeRateRepo.upsert({
      date: input.date,
      fromCurrency: input.currency,
      toCurrency: Currency.CNY,
      rate,
      source: 'auto',
    });

    return new Decimal(rate);
  }
}
