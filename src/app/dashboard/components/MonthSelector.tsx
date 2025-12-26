'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface MonthSelectorProps {
  currentYear: number;
  currentMonth: number;
  availableMonths: Array<{ year: number; month: number }>;
}

/**
 * Month Selector Component
 *
 * 简单的单一下拉选择框，显示所有有数据的月份
 */
export default function MonthSelector({
  currentYear,
  currentMonth,
  availableMonths,
}: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    params.set('month', month.toString());
    router.push(`/dashboard/monthly?${params.toString()}`);
  };

  const currentValue = `${currentYear}-${currentMonth}`;

  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <label htmlFor="month-selector" className="text-sm font-medium text-gray-700">
        选择月份:
      </label>
      <select
        id="month-selector"
        value={currentValue}
        onChange={handleMonthChange}
        className="select flex-1 max-w-xs"
      >
        {availableMonths.map((m) => {
          const value = `${m.year}-${m.month}`;
          const label = `${m.year} 年 ${m.month} 月`;

          // 标注当前月份
          const now = new Date();
          const isCurrentMonth = m.year === now.getFullYear() && m.month === now.getMonth() + 1;
          const displayLabel = isCurrentMonth ? `${label} (当前月)` : label;

          return (
            <option key={value} value={value}>
              {displayLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
