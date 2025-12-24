import { Decimal } from 'decimal.js';
import { ITransactionRepository, ICategoryRepository, IExchangeRateRepository, ICurrencyExchangeService, IAuditLogRepository } from '../ports';
import { Currency, TransactionType, CreateTransactionInput, AuditAction } from '@/domain/entities';
import { InvalidTransactionError } from '@/domain/errors/DomainError';
import { CSVTransaction } from '@/infrastructure/utils/csvHelper';

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: CSVTransaction }>;
}

/**
 * Import Transactions Use Case
 *
 * 批量导入交易并记录审计日志
 */
export class ImportTransactionsUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private categoryRepo: ICategoryRepository,
    private exchangeRateRepo: IExchangeRateRepository,
    private currencyService: ICurrencyExchangeService,
    private auditLogRepo: IAuditLogRepository
  ) {}

  async execute(userId: string, csvData: CSVTransaction[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // 获取用户的所有分类
    const categories = await this.categoryRepo.findByUser(userId);
    const categoryMap = new Map(categories.map((cat) => [cat.name, cat]));

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // +2 因为第一行是表头，行号从1开始

      try {
        // 验证和转换数据
        const input = await this.parseCSVRow(row, userId, categoryMap);

        // 创建交易
        await this.transactionRepo.create(input);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          error: (error as Error).message,
          data: row,
        });
      }
    }

    // 记录导入操作的审计日志
    await this.auditLogRepo.create({
      action: AuditAction.IMPORT_TRANSACTIONS,
      userId,
      details: {
        totalRows: csvData.length,
        successCount: result.success,
        failedCount: result.failed,
        errorSummary: result.errors.map((e) => `行${e.row}: ${e.error}`).slice(0, 10), // 只记录前10个错误
      },
    });

    return result;
  }

  private async parseCSVRow(
    row: CSVTransaction,
    userId: string,
    categoryMap: Map<string, any>
  ): Promise<CreateTransactionInput> {
    // 1. 验证日期
    const dateStr = row.日期.trim();
    if (!dateStr) {
      throw new InvalidTransactionError('日期不能为空');
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new InvalidTransactionError(`日期格式错误: ${dateStr}`);
    }

    // 2. 验证类型
    const typeStr = row.类型.trim();
    let type: TransactionType;
    if (typeStr === '支出' || typeStr === 'EXPENSE') {
      type = TransactionType.EXPENSE;
    } else if (typeStr === '收入' || typeStr === 'INCOME') {
      type = TransactionType.INCOME;
    } else {
      throw new InvalidTransactionError(`类型错误: ${typeStr}，应为"收入"或"支出"`);
    }

    // 3. 查找分类
    const parentCategoryName = row.一级分类.trim();
    const childCategoryName = row.二级分类.trim();

    if (!parentCategoryName) {
      throw new InvalidTransactionError('一级分类不能为空');
    }

    let categoryId: string;

    if (childCategoryName) {
      // 查找子分类
      const childCategory = Array.from(categoryMap.values()).find(
        (cat) =>
          cat.name === childCategoryName &&
          cat.type === type &&
          cat.parentId &&
          categoryMap.get(parentCategoryName)?.id === cat.parentId
      );

      if (!childCategory) {
        throw new InvalidTransactionError(
          `找不到分类: ${parentCategoryName} > ${childCategoryName}`
        );
      }
      categoryId = childCategory.id;
    } else {
      // 只使用父分类
      const parentCategory = categoryMap.get(parentCategoryName);
      if (!parentCategory || parentCategory.type !== type) {
        throw new InvalidTransactionError(`找不到分类: ${parentCategoryName}`);
      }
      categoryId = parentCategory.id;
    }

    // 4. 验证金额
    const amountStr = row.原始金额.trim();
    if (!amountStr) {
      throw new InvalidTransactionError('原始金额不能为空');
    }
    const originalAmount = new Decimal(amountStr);
    if (originalAmount.lte(0)) {
      throw new InvalidTransactionError('原始金额必须大于0');
    }

    // 5. 验证币种
    const currencyStr = row.币种.trim().toUpperCase();
    if (!['CNY', 'USD', 'JPY'].includes(currencyStr)) {
      throw new InvalidTransactionError(`不支持的币种: ${currencyStr}`);
    }
    const currency = currencyStr as Currency;

    // 6. 获取汇率
    let exchangeRate: Decimal;
    const exchangeRateStr = row.汇率?.trim();

    if (currency === Currency.CNY) {
      exchangeRate = new Decimal(1);
    } else if (exchangeRateStr && exchangeRateStr !== '') {
      // 使用用户提供的汇率
      exchangeRate = new Decimal(exchangeRateStr);
      if (exchangeRate.lte(0)) {
        throw new InvalidTransactionError('汇率必须大于0');
      }
    } else {
      // 自动获取汇率
      const cachedRate = await this.exchangeRateRepo.findByDateAndCurrency({
        date,
        fromCurrency: currency,
        toCurrency: Currency.CNY,
      });

      if (cachedRate) {
        exchangeRate = new Decimal(cachedRate.rate.toString());
      } else {
        const rate = await this.currencyService.getRate(date, currency, Currency.CNY);
        if (rate) {
          exchangeRate = new Decimal(rate);
          // 缓存汇率
          await this.exchangeRateRepo.upsert({
            date,
            fromCurrency: currency,
            toCurrency: Currency.CNY,
            rate: exchangeRate.toNumber(),
          });
        } else {
          throw new InvalidTransactionError(
            `无法获取 ${currency} 到 CNY 的汇率，请手动填写汇率列`
          );
        }
      }
    }

    return {
      type,
      categoryId,
      originalAmount,
      currency,
      exchangeRate,
      date,
      description: row.描述?.trim() || undefined,
      notes: row.备注?.trim() || undefined,
      userId,
    };
  }
}
