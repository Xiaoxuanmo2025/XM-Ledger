import { prisma } from '@/infrastructure/database';
import { auth } from '@/infrastructure/auth';
import { redirect } from 'next/navigation';

/**
 * Transactions List Page
 */
export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // 获取最近的交易记录 (最多 50 条)
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">交易记录</h1>
        <p className="text-gray-600 mt-1">
          最近 {transactions.length} 条交易记录
        </p>
      </div>

      <div className="card">
        {transactions.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                      {tx.currency} {parseFloat(tx.originalAmount.toString()).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-mono font-semibold">
                      ¥{parseFloat(tx.amountCNY.toString()).toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 提示: 编辑和删除功能可以在后续版本中添加。
        </p>
      </div>
    </div>
  );
}
