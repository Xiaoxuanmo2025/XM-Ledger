'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  categoryName: string;
  amount: number;
  percentage: number;
}

interface MonthlyChartProps {
  data: CategoryData[];
  title: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export default function MonthlyChart({ data, title, colors = DEFAULT_COLORS }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="card-header">{title}</h3>
        <div className="text-center text-gray-500 py-12">暂无数据</div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.amount,
    percentage: item.percentage.toFixed(1),
  }));

  return (
    <div className="card">
      <h3 className="card-header">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* 详细列表 */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div
            key={item.categoryName}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-700">{item.categoryName}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
