import { ExchangeRate as PrismaExchangeRate } from '@prisma/client';
import Decimal from 'decimal.js';
import { ExchangeRate, Currency } from '@/domain/entities';

/**
 * ExchangeRate Mapper
 */
export class ExchangeRateMapper {
  static toDomain(prismaRate: PrismaExchangeRate): ExchangeRate {
    return {
      id: prismaRate.id,
      date: prismaRate.date,
      fromCurrency: prismaRate.fromCurrency as Currency,
      toCurrency: prismaRate.toCurrency as Currency,
      rate: new Decimal(prismaRate.rate.toString()),
      source: prismaRate.source ?? undefined,
      createdAt: prismaRate.createdAt,
    };
  }
}
