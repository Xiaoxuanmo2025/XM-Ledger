import { getCategories } from '../actions';
import { TransactionType } from '@/domain/entities';

/**
 * Categories Management Page
 */
export default async function CategoriesPage() {
  const categories = await getCategories();

  const expenseCategories = categories.filter(
    (cat) => cat.type === TransactionType.EXPENSE
  );
  const incomeCategories = categories.filter(
    (cat) => cat.type === TransactionType.INCOME
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
        <p className="text-gray-600 mt-1">管理收入和支出分类</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出分类 */}
        <div className="card">
          <h2 className="card-header text-red-600">支出分类</h2>
          <div className="space-y-2">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                  <span className="font-medium text-gray-900">{cat.name}</span>
                </div>
                {cat.color && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 收入分类 */}
        <div className="card">
          <h2 className="card-header text-green-600">收入分类</h2>
          <div className="space-y-2">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                  <span className="font-medium text-gray-900">{cat.name}</span>
                </div>
                {cat.color && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 提示: 分类创建和编辑功能可以在后续版本中添加。当前使用默认分类。
        </p>
      </div>
    </div>
  );
}
