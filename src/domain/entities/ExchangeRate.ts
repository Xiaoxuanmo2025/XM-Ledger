import Decimal from 'decimal.js';
import { Currency } from './Currency';

/**
 * Domain Entity: 汇率信息
 *
 * 业务规则:
 * 1. 所有汇率都是相对于 CNY 的汇率
 * 2. 汇率有时效性,必须记录日期
 */
export interface ExchangeRate {
  id: string;
  date: Date;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: Decimal;
  source?: string;
  createdAt: Date;
}

/**
 * 获取汇率的查询参数
 */
export interface GetExchangeRateQuery {
  date: Date;
  fromCurrency: Currency;
  toCurrency?: Currency; // 默认为 CNY
}
