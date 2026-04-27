"use client";

import { useRef, useEffect } from "react";
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
} from "recharts";
import { useTransactionStore } from "@/store/useTransactionStore";
import { getMonthTransactions, sumByType } from "@/lib/utils";
import CollapsibleSection from "./CollapsibleSection";

const PIE_COLORS_INCOME = ["#3B82F6", "#60A5FA", "#93C5FD"];
const PIE_COLORS_EXPENSE = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F43F5E",
  "#84CC16",
  "#06B6D4",
];

const BAR_SLOT_W = 60;

function buildPieData(
  transactions: ReturnType<typeof getMonthTransactions>,
  type: "income" | "expense",
) {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildYearBarData(
  transactions: ReturnType<typeof useTransactionStore.getState>["transactions"],
  year: number,
) {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const txs = getMonthTransactions(transactions, year, month);
    return {
      label: `${month}월`,
      month,
      income: sumByType(txs, "income"),
      expense: sumByType(txs, "expense"),
    };
  });
}

function formatYAxis(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return String(value);
}

function EmptyPie({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-medium mb-2" style={{ color }}>
        {label}
      </p>
      <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-100 flex items-center justify-center">
        <span className="text-[10px] text-gray-300 text-center leading-tight">
          데이터
          <br />
          없음
        </span>
      </div>
    </div>
  );
}

export default function Charts() {
  const { transactions, selectedYear, selectedMonth } = useTransactionStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const monthly = getMonthTransactions(
    transactions,
    selectedYear,
    selectedMonth,
  );

  const incPieData = buildPieData(monthly, "income");
  const expPieData = buildPieData(monthly, "expense");
  const barData = buildYearBarData(transactions, selectedYear);

  useEffect(() => {
    if (!scrollRef.current) return;
    const containerW = scrollRef.current.clientWidth;
    const targetX = (selectedMonth - 1) * BAR_SLOT_W;
    scrollRef.current.scrollLeft = Math.max(
      0,
      targetX - containerW / 2 + BAR_SLOT_W / 2,
    );
  }, [selectedMonth, selectedYear]);

  const renderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    const isSelected = payload.value === `${selectedMonth}월`;
    return (
      <g transform={`translate(${x},${y})`}>
        {isSelected && (
          <rect x={-16} y={2} width={32} height={15} rx={7} fill="#EEF2FF" />
        )}
        <text
          textAnchor="middle"
          dy={13}
          fontSize={10}
          fontWeight={isSelected ? 700 : 400}
          fill={isSelected ? "#6366F1" : "#9CA3AF"}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="mb-4 flex flex-col">
      {/* Bar Chart — 12 months of selected year, 6 visible, scrollable */}
      <CollapsibleSection
        title="월별 수입 / 지출 흐름"
        subtitle={`${selectedYear}년`}
      >
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <BarChart
            width={12 * BAR_SLOT_W}
            height={210}
            data={barData}
            barSize={12}
            barGap={2}
            barCategoryGap={18}
            margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={renderCustomTick}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={28}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(v) =>
                typeof v === "number" ? v.toLocaleString("ko-KR") + "원" : v
              }
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E5E7EB",
              }}
            />
            <Legend
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="income" name="수입" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell
                  key={i}
                  fill="#3B82F6"
                  fillOpacity={entry.month === selectedMonth ? 1 : 0.3}
                />
              ))}
            </Bar>
            <Bar dataKey="expense" name="지출" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell
                  key={i}
                  fill="#EF4444"
                  fillOpacity={entry.month === selectedMonth ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </CollapsibleSection>
      {/* Pie Charts */}
      <CollapsibleSection title="수입 / 지출 분포">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {incPieData.length > 0 ? (
              <div>
                <p className="text-xs text-center text-blue-500 font-medium mb-1">
                  수입
                </p>
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
                        <Cell
                          key={i}
                          fill={PIE_COLORS_INCOME[i % PIE_COLORS_INCOME.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) =>
                        typeof v === "number"
                          ? v.toLocaleString("ko-KR") + "원"
                          : v
                      }
                      contentStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-1 gap-y-0.5 grid grid-cols-2">
                  {incPieData.map((d, i) => (
                    <li
                      key={d.name}
                      className="flex items-center gap-1 text-[10px] text-gray-600"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            PIE_COLORS_INCOME[i % PIE_COLORS_INCOME.length],
                        }}
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

            {expPieData.length > 0 ? (
              <div>
                <p className="text-xs text-center text-red-500 font-medium mb-1">
                  지출
                </p>
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
                        <Cell
                          key={i}
                          fill={
                            PIE_COLORS_EXPENSE[i % PIE_COLORS_EXPENSE.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) =>
                        typeof v === "number"
                          ? v.toLocaleString("ko-KR") + "원"
                          : v
                      }
                      contentStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-1 gap-y-0.5 grid grid-cols-2">
                  {expPieData.map((d, i) => (
                    <li
                      key={d.name}
                      className="flex items-center gap-1 text-[10px] text-gray-600"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            PIE_COLORS_EXPENSE[i % PIE_COLORS_EXPENSE.length],
                        }}
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
      </CollapsibleSection>
    </div>
  );
}
