'use client';

import { useState } from 'react';
import { TransactionType } from '@/domain/entities';
import { createCategory, deleteCategory } from '../actions';

interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
  children?: Category[];
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const expenseCategories = categories.filter(
    (cat) => cat.type === TransactionType.EXPENSE && !cat.parentId
  );
  const incomeCategories = categories.filter(
    (cat) => cat.type === TransactionType.INCOME && !cat.parentId
  );

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const newCategory = await createCategory({
        name: formData.get('name') as string,
        type: newCategoryType,
        color: formData.get('color') as string,
        icon: formData.get('icon') as string,
        parentId: (formData.get('parentId') as string) || null,
      });

      // Refresh categories from server to get the updated list with children
      window.location.reload();
    } catch (error) {
      alert('创建分类失败: ' + (error as Error).message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('确定要删除这个分类吗？如果分类下有交易记录或子分类将无法删除。')) {
      return;
    }

    setDeletingId(categoryId);
    try {
      await deleteCategory(categoryId);
      window.location.reload();
    } catch (error) {
      alert('删除失败: ' + (error as Error).message);
      setDeletingId(null);
    }
  };

  const renderCategoryTree = (
    categoryList: Category[],
    typeColor: string,
    isExpense: boolean
  ) => {
    return (
      <div className="space-y-2">
        {categoryList.map((cat) => (
          <div key={cat.id}>
            {/* 父分类 */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                <span className="font-medium text-gray-900">{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <span className="text-xs text-gray-500">
                    ({cat.children.length} 个子分类)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cat.color && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  disabled={deletingId === cat.id}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  删除
                </button>
              </div>
            </div>

            {/* 子分类 */}
            {cat.children && cat.children.length > 0 && (
              <div className="ml-8 mt-2 space-y-2">
                {cat.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between py-2 px-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">└─</span>
                      {child.icon && <span className="text-xl">{child.icon}</span>}
                      <span className="text-gray-700">{child.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {child.color && (
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: child.color }}
                        />
                      )}
                      <button
                        onClick={() => handleDeleteCategory(child.id)}
                        disabled={deletingId === child.id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-600 mt-1">管理收入和支出分类（支持两级分类）</p>
        </div>
        <button
          onClick={() => setIsAddingCategory(!isAddingCategory)}
          className="btn-primary"
        >
          {isAddingCategory ? '取消' : '+ 新增分类'}
        </button>
      </div>

      {/* 新增分类表单 */}
      {isAddingCategory && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">新增分类</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类类型 *
                </label>
                <select
                  value={newCategoryType}
                  onChange={(e) =>
                    setNewCategoryType(e.target.value as TransactionType)
                  }
                  className="select"
                >
                  <option value={TransactionType.EXPENSE}>支出</option>
                  <option value={TransactionType.INCOME}>收入</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  父分类 (可选)
                </label>
                <select name="parentId" className="select">
                  <option value="">无 (创建为一级分类)</option>
                  {(newCategoryType === TransactionType.EXPENSE
                    ? expenseCategories
                    : incomeCategories
                  ).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类名称 *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="例如: AWS、月薪、奖金"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  颜色 (可选)
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#3B82F6"
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图标 (可选)
                </label>
                <input
                  type="text"
                  name="icon"
                  placeholder="例如: 💰 ☁️ 🏢"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                创建分类
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出分类 */}
        <div className="card">
          <h2 className="card-header text-red-600">支出分类</h2>
          {renderCategoryTree(expenseCategories, 'text-red-600', true)}
        </div>

        {/* 收入分类 */}
        <div className="card">
          <h2 className="card-header text-green-600">收入分类</h2>
          {renderCategoryTree(incomeCategories, 'text-green-600', false)}
        </div>
      </div>
    </div>
  );
}
