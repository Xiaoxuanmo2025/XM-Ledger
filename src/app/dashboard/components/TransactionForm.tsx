'use client';

import { useState } from 'react';
import { Currency, TransactionType } from '@/domain/entities';

interface TransactionFormProps {
  categories: Array<{ id: string; name: string; type: TransactionType }>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
}

export interface TransactionFormData {
  type: TransactionType;
  categoryId: string;
  originalAmount: string;
  currency: Currency;
  date: string;
  description?: string;
  notes?: string;
  exchangeRate?: string;
}

export default function TransactionForm({ categories, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [currency, setCurrency] = useState<Currency>(Currency.CNY);
  const [showExchangeRate, setShowExchangeRate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Save form element reference synchronously because React may release
    // the synthetic event after an await, which would make e.currentTarget null.
    const form = e.currentTarget;

    const data: TransactionFormData = {
      type,
      categoryId: formData.get('categoryId') as string,
      originalAmount: formData.get('originalAmount') as string,
      currency,
      date: formData.get('date') as string,
      description: formData.get('description') as string || undefined,
      notes: formData.get('notes') as string || undefined,
      exchangeRate: (() => {
        if (!showExchangeRate) return undefined;
        const v = (formData.get('exchangeRate') as string) ?? '';
        const trimmed = v.trim();
        return trimmed === '' ? undefined : trimmed;
      })(),
    };

    try {
      await onSubmit(data);
      form.reset();
      setShowExchangeRate(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('创建交易失败: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    // 如果选择非 CNY 币种,显示汇率输入
    setShowExchangeRate(newCurrency !== Currency.CNY);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="card-header">新增交易</h2>

      <div className="space-y-4">
        {/* 交易类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            交易类型
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === TransactionType.EXPENSE}
                onChange={() => setType(TransactionType.EXPENSE)}
                className="mr-2"
              />
              <span className="text-red-600 font-medium">支出</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === TransactionType.INCOME}
                onChange={() => setType(TransactionType.INCOME)}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">收入</span>
            </label>
          </div>
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类 *
          </label>
          <select name="categoryId" required className="select">
            <option value="">请选择分类</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 金额和币种 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金额 *
            </label>
            <input
              type="number"
              name="originalAmount"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              币种
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
              className="select"
            >
              <option value={Currency.CNY}>CNY (人民币)</option>
              <option value={Currency.USD}>USD (美元)</option>
              <option value={Currency.JPY}>JPY (日元)</option>
            </select>
          </div>
        </div>

        {/* 汇率输入 (仅非 CNY 时显示) */}
        {showExchangeRate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              汇率 (对 CNY) - 可选
            </label>
            <input
              type="number"
              name="exchangeRate"
              step="0.000001"
              min="0"
              placeholder="留空则自动获取"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              不填写将自动获取当日汇率,如自动获取失败需手动输入
            </p>
          </div>
        )}

        {/* 日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            日期 *
          </label>
          <input
            type="date"
            name="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="input"
          />
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <input
            type="text"
            name="description"
            placeholder="例如: AWS EC2 月度费用"
            className="input"
          />
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="补充说明..."
            className="input resize-none"
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : '创建交易'}
          </button>
          <button
            type="reset"
            className="btn-secondary"
            onClick={() => setShowExchangeRate(false)}
          >
            重置
          </button>
        </div>
      </div>
    </form>
  );
}
