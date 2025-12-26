import { Suspense } from 'react';
import TransactionForm, {
  TransactionFormData,
} from './components/TransactionForm';
import StatsCard from './components/StatsCard';
import MonthlyChart from './components/MonthlyChart';
import MonthSelector from './components/MonthSelector';
import {
  createTransaction,
  getMonthlyReport,
  getOrInitializeCategories,
  getAvailableMonths,
  getOverallSummary,
} from './actions';

/**
 * Dashboard Page
 *
 * 显示:
 * 1. 本月统计卡片 (收入、支出、余额)
 * 2. 收支构成饼图
 * 3. 新增交易表单
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  // 获取当前年月
  const now = new Date();
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  // 获取分类列表 (如果不存在则自动创建默认分类)
  const categories = await getOrInitializeCategories();

  // 获取月度报表
  const report = await getMonthlyReport(year, month);

  // 获取有数据的月份列表
  const availableMonths = await getAvailableMonths();

  // 获取总体统计数据
  const overallData = await getOverallSummary();

  // Server Action 处理表单提交
  async function handleCreateTransaction(data: TransactionFormData) {
    'use server';
    await createTransaction(data);
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">财务总览</h1>
        <p className="text-gray-600 mt-1">所有金额已按当日汇率统一转换为人民币 (CNY)</p>
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

      {/* 月度数据分隔线 */}
      <div className="border-t-2 border-gray-300 pt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {year} 年 {month} 月 数据
        </h2>
      </div>

      {/* 月份选择器 */}
      <MonthSelector
        currentYear={year}
        currentMonth={month}
        availableMonths={availableMonths}
      />

      {/* 月度统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="本月收入"
          value={report.summary.totalIncome}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="本月支出"
          value={report.summary.totalExpense}
          icon="💸"
          color="red"
        />
        <StatsCard
          title="本月净余额"
          value={report.summary.balance}
          icon="📊"
          color={report.summary.balance >= 0 ? 'blue' : 'gray'}
        />
      </div>

      {/* 月度图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="card">加载中...</div>}>
          <MonthlyChart
            data={report.expenseByCategory}
            title="本月支出构成"
            colors={['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']}
          />
        </Suspense>

        <Suspense fallback={<div className="card">加载中...</div>}>
          <MonthlyChart
            data={report.incomeByCategory}
            title="本月收入构成"
            colors={['#10B981', '#3B82F6', '#14B8A6', '#06B6D4', '#8B5CF6']}
          />
        </Suspense>
      </div>

      {/* 新增交易表单 */}
      <TransactionForm
        categories={categories}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}
