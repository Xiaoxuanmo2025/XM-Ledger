import { Suspense } from 'react';
import TransactionForm, {
  TransactionFormData,
} from './components/TransactionForm';
import StatsCard from './components/StatsCard';
import MonthlyChart from './components/MonthlyChart';
import {
  createTransaction,
  getMonthlyReport,
  getOrInitializeCategories,
} from './actions';

/**
 * Dashboard Page
 *
 * 显示:
 * 1. 本月统计卡片 (收入、支出、余额)
 * 2. 收支构成饼图
 * 3. 新增交易表单
 */
export default async function DashboardPage() {
  // 获取当前年月
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 获取分类列表 (如果不存在则自动创建默认分类)
  const categories = await getOrInitializeCategories();

  // 获取月度报表
  const report = await getMonthlyReport(year, month);

  // Server Action 处理表单提交
  async function handleCreateTransaction(data: TransactionFormData) {
    'use server';
    await createTransaction(data);
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {year} 年 {month} 月 财务总览
        </h1>
        <p className="text-gray-600 mt-1">所有金额已按当日汇率统一转换为人民币 (CNY)</p>
      </div>

      {/* 统计卡片 */}
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
          title="净余额"
          value={report.summary.balance}
          icon="📊"
          color={report.summary.balance >= 0 ? 'blue' : 'gray'}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="card">加载中...</div>}>
          <MonthlyChart
            data={report.expenseByCategory}
            title="支出构成"
            colors={['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']}
          />
        </Suspense>

        <Suspense fallback={<div className="card">加载中...</div>}>
          <MonthlyChart
            data={report.incomeByCategory}
            title="收入构成"
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
