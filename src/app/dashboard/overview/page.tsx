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
    ...data.map((d) => Math.max(d.income, d.expense)),
    1 // 至少为1，避免除以0
  );

  return (
    <div className="p-4 md:p-6">
      {/* 图表容器 - 在移动端可以横向滚动 */}
      <div className="overflow-x-auto md:overflow-x-visible -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-end justify-between gap-1 md:gap-2 h-64 min-w-[600px] md:min-w-0">
          {data.map((item, index) => {
            // 计算百分比高度，如果有值则至少显示3%的高度
            const incomeHeight = item.income > 0
              ? Math.max((item.income / maxValue) * 100, 3)
              : 0;
            const expenseHeight = item.expense > 0
              ? Math.max((item.expense / maxValue) * 100, 3)
              : 0;

            // 调试：打印每个柱子的高度
            console.log(`Month ${item.month}: income=${item.income}, expense=${item.expense}, incomeHeight=${incomeHeight}%, expenseHeight=${expenseHeight}%`);

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-[40px]">
                {/* 柱子容器 - 固定高度 */}
                <div className="flex gap-0.5 md:gap-1 items-end w-full" style={{ height: '240px' }}>
                  {/* 收入柱 */}
                  <div
                    className={`flex-1 rounded-t transition-all relative group ${
                      item.income > 0
                        ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                        : 'bg-gray-200'
                    }`}
                    style={{ height: `${incomeHeight}%` }}
                    title={`收入: ¥${item.income.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    {item.income > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        收入: ¥{item.income.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                  {/* 支出柱 */}
                  <div
                    className={`flex-1 rounded-t transition-all relative group ${
                      item.expense > 0
                        ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                        : 'bg-gray-200'
                    }`}
                    style={{ height: `${expenseHeight}%` }}
                    title={`支出: ¥${item.expense.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    {item.expense > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        支出: ¥{item.expense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>
                {/* 月份标签 */}
                <div className="text-[10px] md:text-xs text-gray-600 text-center whitespace-nowrap">
                  {item.month.split('-')[1]}月
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 提示文字 - 仅在移动端显示 */}
      <div className="text-xs text-gray-500 text-center mt-2 md:hidden">
        👈 左右滑动查看更多
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-4 md:gap-6 mt-4 md:mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
          <span className="text-xs md:text-sm text-gray-700">收入</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded"></div>
          <span className="text-xs md:text-sm text-gray-700">支出</span>
        </div>
      </div>
    </div>
  );
}
