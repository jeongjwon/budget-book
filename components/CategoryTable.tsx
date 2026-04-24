'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  Category,
  TransactionType,
} from '@/types/transaction';
import {
  getMonthTransactions,
  formatAmount,
  calcPercentChange,
  getPrevMonth,
} from '@/lib/utils';

function Badge({ pct, type }: { pct: number | null; type: TransactionType }) {
  if (pct === null) return <span className="text-xs text-gray-300">-</span>;
  if (pct === 0) return <span className="text-xs text-gray-300">±0%</span>;

  const isUp = pct > 0;
  const color =
    type === 'expense'
      ? isUp
        ? 'text-red-500 bg-red-50'
        : 'text-emerald-500 bg-emerald-50'
      : isUp
        ? 'text-blue-500 bg-blue-50'
        : 'text-orange-500 bg-orange-50';

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      {isUp ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

function CategorySection({
  title,
  categories,
  type,
}: {
  title: string;
  categories: readonly Category[];
  type: TransactionType;
}) {
  const { transactions, selectedYear, selectedMonth } = useTransactionStore();
  const { year: prevYear, month: prevMonth } = getPrevMonth(selectedYear, selectedMonth);

  const current = getMonthTransactions(transactions, selectedYear, selectedMonth);
  const prev = getMonthTransactions(transactions, prevYear, prevMonth);

  const sumForCategory = (txs: typeof transactions, cat: Category) =>
    txs.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0);

  const rows = categories
    .map((cat) => {
      const cur = sumForCategory(current, cat);
      const pre = sumForCategory(prev, cat);
      return { cat, cur, pre };
    })
    .filter((r) => r.cur > 0 || r.pre > 0)
    .sort((a, b) => b.cur - a.cur);

  if (rows.length === 0) return null;

  return (
    <div className="mb-2">
      <h3
        className={`text-xs font-semibold px-4 py-1.5 ${
          type === 'income' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
        }`}
      >
        {title}
      </h3>
      {rows.map(({ cat, cur, pre }) => (
        <div
          key={cat}
          className="flex items-center px-4 py-2.5 border-b border-gray-50 last:border-0"
        >
          <span className="flex-1 text-sm text-gray-700">{cat}</span>
          <span
            className={`text-sm font-medium mr-3 ${type === 'income' ? 'text-blue-500' : 'text-red-500'}`}
          >
            {formatAmount(cur)}
          </span>
          <Badge pct={calcPercentChange(cur, pre)} type={type} />
        </div>
      ))}
    </div>
  );
}

export default function CategoryTable() {
  const { transactions, selectedYear, selectedMonth } = useTransactionStore();
  const monthly = getMonthTransactions(transactions, selectedYear, selectedMonth);
  const isEmpty = monthly.length === 0;

  return (
    <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700">카테고리별 내역</h2>
        <p className="text-xs text-gray-400 mt-0.5">지난달 대비 증감</p>
      </div>
      {isEmpty ? (
        <div className="py-8 text-center text-sm text-gray-300">
          거래를 추가하면 카테고리별 내역이 표시됩니다
        </div>
      ) : (
        <>
          <CategorySection title="수입" categories={INCOME_CATEGORIES} type="income" />
          <CategorySection title="지출" categories={EXPENSE_CATEGORIES} type="expense" />
        </>
      )}
    </div>
  );
}
