'use client';

import { useState } from 'react';
import { deleteTransaction } from '../actions';

interface Transaction {
  id: string;
  date: Date;
  type: string;
  description: string | null;
  originalAmount: string;
  currency: string;
  amountCNY: string;
  category: {
    name: string;
  };
}

interface TransactionListProps {
  initialTransactions: Transaction[];
}

export default function TransactionList({
  initialTransactions,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (transactionId: string) => {
    if (!confirm('确定要删除这条交易记录吗？此操作不可撤销。')) {
      return;
    }

    setDeletingId(transactionId);
    try {
      await deleteTransaction(transactionId);
      window.location.reload();
    } catch (error) {
      alert('删除失败: ' + (error as Error).message);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">交易记录</h1>
        <p className="text-gray-600 mt-1">
          最近 {initialTransactions.length} 条交易记录
        </p>
      </div>

      <div className="card">
        {initialTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无交易记录,请在首页创建交易
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    日期
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    分类
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    描述
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    原始金额
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    人民币金额
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          tx.type === 'INCOME'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '收入' : '支出'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {tx.category.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {tx.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-mono">
                      {tx.currency}{' '}
                      {parseFloat(tx.originalAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-mono font-semibold">
                      ¥
                      {parseFloat(tx.amountCNY).toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === tx.id ? '删除中...' : '删除'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
