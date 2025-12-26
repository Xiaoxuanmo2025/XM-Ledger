import { Suspense } from 'react';
import StatsCard from '../components/StatsCard';
import MonthlyChart from '../components/MonthlyChart';
import TransactionForm, { TransactionFormData } from '../components/TransactionForm';
import { getOverallSummary, getMonthlyTrend, createTransaction, getOrInitializeCategories } from '../actions';
import Link from 'next/link';

/**
 * Overview Page - 总资产状况页面
 *
 * 显示:
 * 1. 总资产统计卡片
 * 2. 总体收支构成饼图
 * 3. 最近12个月的收入支出趋势柱状图
 * 4. 新增交易表单
 */
export default async function OverviewPage() {
  // 获取总体统计数据
  const overallData = await getOverallSummary();

  // 获取最近12个月的趋势数据
  const trendData = await getMonthlyTrend();

  // 获取分类列表
  const categories = await getOrInitializeCategories();

  // Server Action 处理表单提交
  async function handleCreateTransaction(data: TransactionFormData) {
    'use server';
    await createTransaction(data);
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">总资产概览</h1>
          <p className="text-gray-600 mt-1">所有金额已按当日汇率统一转换为人民币 (CNY)</p>
        </div>
        <Link
          href="/dashboard/monthly"
          className="btn btn-primary"
        >
          查看月度明细
        </Link>
      </div>

      {/* 总体统计卡片 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">总资产状况</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="总收入"
            value={overallData.summary.totalIncome}
            icon="💰"
            color="green"
          />
          <StatsCard
            title="总支出"
            value={overallData.summary.totalExpense}
            icon="💸"
            color="red"
          />
          <StatsCard
            title="总余额"
            value={overallData.summary.balance}
            icon="📊"
            color={overallData.summary.balance >= 0 ? 'blue' : 'gray'}
          />
        </div>
      </div>

      {/* 最近12个月趋势图 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">最近12个月趋势</h2>
        <div className="card">
          <MonthlyTrendChart data={trendData} />
        </div>
      </div>

      {/* 总体收支构成 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">总体收支构成</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="card">加载中...</div>}>
            <MonthlyChart
              data={overallData.expenseByCategory}
              title="总支出构成"
              colors={['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']}
            />
          </Suspense>

          <Suspense fallback={<div className="card">加载中...</div>}>
            <MonthlyChart
              data={overallData.incomeByCategory}
              title="总收入构成"
              colors={['#10B981', '#3B82F6', '#14B8A6', '#06B6D4', '#8B5CF6']}
            />
          </Suspense>
        </div>
      </div>

      {/* 新增交易表单 */}
      <TransactionForm
        categories={categories}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}

/**
 * 月度趋势柱状图组件
 */
function MonthlyTrendChart({
  data,
}: {
  data: Array<{ month: string; income: number; expense: number }>;
}) {
  // 计算最大值用于设置柱状图高度
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense))
  );

  return (
    <div className="p-6">
      <div className="flex items-end justify-between gap-2 h-64">
        {data.map((item, index) => {
          const incomeHeight = maxValue > 0 ? (item.income / maxValue) * 100 : 0;
          const expenseHeight = maxValue > 0 ? (item.expense / maxValue) * 100 : 0;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* 柱子容器 */}
              <div className="flex gap-1 items-end h-full w-full">
                {/* 收入柱 */}
                <div
                  className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                  style={{ height: `${incomeHeight}%` }}
                  title={`收入: ¥${item.income.toLocaleString()}`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    收入: ¥{item.income.toLocaleString()}
                  </div>
                </div>
                {/* 支出柱 */}
                <div
                  className="flex-1 bg-red-500 rounded-t hover:bg-red-600 transition-colors relative group"
                  style={{ height: `${expenseHeight}%` }}
                  title={`支出: ¥${item.expense.toLocaleString()}`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    支出: ¥{item.expense.toLocaleString()}
                  </div>
                </div>
              </div>
              {/* 月份标签 */}
              <div className="text-xs text-gray-600 text-center whitespace-nowrap">
                {item.month}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">收入</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700">支出</span>
        </div>
      </div>
    </div>
  );
}
