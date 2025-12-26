import { Suspense } from 'react';
import StatsCard from '../components/StatsCard';
import MonthlyChart from '../components/MonthlyChart';
import MonthSelector from '../components/MonthSelector';
import {
  getMonthlyReport,
  getAvailableMonths,
} from '../actions';
import Link from 'next/link';

/**
 * Monthly Page - 月度明细页面
 *
 * 显示:
 * 1. 月度统计卡片
 * 2. 月度收支构成饼图
 * 3. 月份选择器
 */
export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  // 获取当前年月
  const now = new Date();
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  // 获取月度报表
  const report = await getMonthlyReport(year, month);

  // 获取有数据的月份列表
  const availableMonths = await getAvailableMonths();

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {year} 年 {month} 月 财务明细
          </h1>
          <p className="text-gray-600 mt-1">所有金额已按当日汇率统一转换为人民币 (CNY)</p>
        </div>
        <Link
          href="/dashboard/overview"
          className="btn btn-outline"
        >
          返回总览
        </Link>
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
    </div>
  );
}
