'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTransactionStore } from '@/store/useTransactionStore';
import { getMonthTransactions, sumByType, getPrevMonth } from '@/lib/utils';

const PIE_COLORS_INCOME = ['#3B82F6', '#60A5FA', '#93C5FD'];
const PIE_COLORS_EXPENSE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
  '#F43F5E', '#84CC16', '#06B6D4',
];

function buildPieData(transactions: ReturnType<typeof getMonthTransactions>, type: 'income' | 'expense') {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildBarData(
  transactions: ReturnType<typeof useTransactionStore.getState>['transactions'],
  selectedYear: number,
  selectedMonth: number,
) {
  const months: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let year = selectedYear;
    let month = selectedMonth - i;
    while (month <= 0) {
      month += 12;
      year -= 1;
    }
    const txs = getMonthTransactions(transactions, year, month);
    months.push({
      label: `${month}월`,
      income: sumByType(txs, 'income'),
      expense: sumByType(txs, 'expense'),
    });
  }
  return months;
}

function formatYAxis(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return String(value);
}

function EmptyPie({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-medium mb-2" style={{ color }}>{label}</p>
      <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-100 flex items-center justify-center">
        <span className="text-[10px] text-gray-300 text-center leading-tight">데이터<br />없음</span>
      </div>
    </div>
  );
}

export default function Charts() {
  const { transactions, selectedYear, selectedMonth } = useTransactionStore();
  const monthly = getMonthTransactions(transactions, selectedYear, selectedMonth);

  const incPieData = buildPieData(monthly, 'income');
  const expPieData = buildPieData(monthly, 'expense');
  const barData = buildBarData(transactions, selectedYear, selectedMonth);

  return (
    <div className="mx-4 mt-4 mb-4 flex flex-col gap-4">
      {/* Pie Charts */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-700 mb-4">수입 / 지출 분포</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Income pie */}
          {incPieData.length > 0 ? (
            <div>
              <p className="text-xs text-center text-blue-500 font-medium mb-1">수입</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={incPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_INCOME[i % PIE_COLORS_INCOME.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => typeof v === 'number' ? v.toLocaleString('ko-KR') + '원' : v}
                    contentStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-1 space-y-0.5">
                {incPieData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-1 text-[10px] text-gray-600">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PIE_COLORS_INCOME[i % PIE_COLORS_INCOME.length] }}
                    />
                    {d.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <EmptyPie label="수입" color="#3B82F6" />
            </div>
          )}

          {/* Expense pie */}
          {expPieData.length > 0 ? (
            <div>
              <p className="text-xs text-center text-red-500 font-medium mb-1">지출</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={expPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_EXPENSE[i % PIE_COLORS_EXPENSE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => typeof v === 'number' ? v.toLocaleString('ko-KR') + '원' : v}
                    contentStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-1 space-y-0.5">
                {expPieData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-1 text-[10px] text-gray-600">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PIE_COLORS_EXPENSE[i % PIE_COLORS_EXPENSE.length] }}
                    />
                    {d.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <EmptyPie label="지출" color="#EF4444" />
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart — always visible */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-700 mb-4">월별 수입 / 지출 흐름</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barGap={2} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(v) => typeof v === 'number' ? v.toLocaleString('ko-KR') + '원' : v}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            />
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="income" name="수입" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="지출" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
