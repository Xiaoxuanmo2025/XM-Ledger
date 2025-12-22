import { PrismaClient } from '@prisma/client';
import { ExchangeRate, GetExchangeRateQuery, Currency } from '@/domain/entities';
import { IExchangeRateRepository } from '@/use-cases/ports';
import { ExchangeRateMapper } from './mappers/ExchangeRateMapper';

/**
 * Prisma ExchangeRate Repository Implementation
 */
export class PrismaExchangeRateRepository implements IExchangeRateRepository {
  constructor(private prisma: PrismaClient) {}

  async upsert(data: {
    date: Date;
    fromCurrency: Currency;
    toCurrency: Currency;
    rate: number;
    source?: string;
  }): Promise<ExchangeRate> {
    // 标准化日期 (只保留年月日)
    const normalizedDate = new Date(data.date);
    normalizedDate.setHours(0, 0, 0, 0);

    const exchangeRate = await this.prisma.exchangeRate.upsert({
      where: {
        date_fromCurrency_toCurrency: {
          date: normalizedDate,
          fromCurrency: data.fromCurrency,
          toCurrency: data.toCurrency,
        },
      },
      update: {
        rate: data.rate,
        source: data.source,
      },
      create: {
        date: normalizedDate,
        fromCurrency: data.fromCurrency,
        toCurrency: data.toCurrency,
        rate: data.rate,
        source: data.source,
      },
    });

    return ExchangeRateMapper.toDomain(exchangeRate);
  }

  async findByDateAndCurrency(
    query: GetExchangeRateQuery
  ): Promise<ExchangeRate | null> {
    const normalizedDate = new Date(query.date);
    normalizedDate.setHours(0, 0, 0, 0);

    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: {
        date_fromCurrency_toCurrency: {
          date: normalizedDate,
          fromCurrency: query.fromCurrency,
          toCurrency: query.toCurrency ?? Currency.CNY,
        },
      },
    });

    return exchangeRate ? ExchangeRateMapper.toDomain(exchangeRate) : null;
  }

  async findMany(queries: GetExchangeRateQuery[]): Promise<ExchangeRate[]> {
    const whereConditions = queries.map((q) => {
      const normalizedDate = new Date(q.date);
      normalizedDate.setHours(0, 0, 0, 0);

      return {
        date: normalizedDate,
        fromCurrency: q.fromCurrency,
        toCurrency: q.toCurrency ?? Currency.CNY,
      };
    });

    const exchangeRates = await this.prisma.exchangeRate.findMany({
      where: {
        OR: whereConditions,
      },
    });

    return exchangeRates.map(ExchangeRateMapper.toDomain);
  }
}
