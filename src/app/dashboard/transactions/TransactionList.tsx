'use client';

import { useState } from 'react';
import { deleteTransaction, exportTransactionsToCSV, importTransactionsFromCSV } from '../actions';
import { downloadCSV } from '@/infrastructure/utils/csvHelper';

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
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = await exportTransactionsToCSV();
      const filename = `交易记录_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      alert('导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const csvContent = await file.text();
      const result = await importTransactionsFromCSV(csvContent);

      if (result.failed === 0) {
        alert(`导入成功！共导入 ${result.success} 条记录。`);
        window.location.reload();
      } else {
        const errorDetails = result.errors
          .map((e) => `第 ${e.row} 行: ${e.error}`)
          .join('\n');
        alert(
          `导入完成，成功 ${result.success} 条，失败 ${result.failed} 条。\n\n失败详情：\n${errorDetails}`
        );
        window.location.reload();
      }
    } catch (error) {
      alert('导入失败: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
      // 重置文件输入
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">交易记录</h1>
          <p className="text-gray-600 mt-1">
            最近 {initialTransactions.length} 条交易记录
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || initialTransactions.length === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '导出中...' : '📥 导出 CSV'}
          </button>
          <label className="btn-primary cursor-pointer disabled:opacity-50">
            {isImporting ? '导入中...' : '📤 导入 CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
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

      {/* CSV 格式说明 */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV 格式说明</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>必填字段：</strong>日期 (YYYY-MM-DD)、类型 (支出/收入)、一级分类、原始金额、币种 (CNY/USD/JPY)
          </p>
          <p>
            <strong>可选字段：</strong>二级分类、描述、汇率 (不填自动获取)、备注
          </p>
          <p>
            <strong>示例：</strong>
          </p>
          <code className="block bg-white p-2 rounded text-xs">
            日期,类型,一级分类,二级分类,描述,原始金额,币种,汇率,备注<br />
            2024-01-15,支出,云服务,AWS,EC2服务器,100.50,USD,,1月账单
          </code>
        </div>
      </div>
    </div>
  );
}
