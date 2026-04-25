"use client";

import { useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import CollapsibleSection from "./CollapsibleSection";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  Category,
  TransactionType,
  Transaction,
} from "@/types/transaction";
import {
  getMonthTransactions,
  formatAmount,
  calcChange,
  getPrevMonth,
} from "@/lib/utils";

function Badge({
  amount,
  type,
}: {
  amount: number | null;
  type: TransactionType;
}) {
  if (amount === null) return <span className="text-xs text-gray-300">-</span>;
  if (amount === 0) return <span className="text-xs text-gray-300">±0</span>;

  const isUp = amount > 0;
  const color =
    type === "expense"
      ? isUp
        ? "text-red-500 bg-red-50"
        : "text-emerald-500 bg-emerald-50"
      : isUp
        ? "text-blue-500 bg-blue-50"
        : "text-orange-500 bg-orange-50";

  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}
    >
      {isUp ? "▲" : "▼"} {formatAmount(Math.abs(amount))}
    </span>
  );
}

function TransactionList({
  txs,
  type,
}: {
  txs: Transaction[];
  type: TransactionType;
}) {
  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="bg-gray-50 border-t border-gray-100">
      {sorted.map((tx) => {
        const [, m, d] = tx.date.split("-");
        return (
          <div
            key={tx.id}
            className="flex items-center px-5 py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-xs text-gray-400 w-10 shrink-0">
              {m}/{d}
            </span>
            <span className="flex-1 text-xs text-gray-500 truncate">
              {tx.memo || "메모 없음"}
            </span>
            <span
              className={`text-xs font-medium ${type === "income" ? "text-blue-500" : "text-red-500"}`}
            >
              {formatAmount(tx.amount)}
            </span>
          </div>
        );
      })}
    </div>
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
  const [openCat, setOpenCat] = useState<Category | null>(null);
  const { year: prevYear, month: prevMonth } = getPrevMonth(
    selectedYear,
    selectedMonth,
  );

  const current = getMonthTransactions(
    transactions,
    selectedYear,
    selectedMonth,
  );
  const prev = getMonthTransactions(transactions, prevYear, prevMonth);

  const sumForCategory = (txs: typeof transactions, cat: Category) =>
    txs.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0);

  const rows = categories
    .map((cat) => {
      const cur = sumForCategory(current, cat);
      const pre = sumForCategory(prev, cat);
      const txs = current.filter((t) => t.category === cat);
      return { cat, cur, pre, txs };
    })
    .filter((r) => r.cur > 0 || r.pre > 0)
    .sort((a, b) => b.cur - a.cur);

  if (rows.length === 0) return null;

  return (
    <div className="mb-2">
      <h3
        className={`text-xs font-semibold px-4 py-1.5 ${
          type === "income"
            ? "text-blue-600 bg-blue-50"
            : "text-red-600 bg-red-50"
        }`}
      >
        {title}
      </h3>
      {rows.map(({ cat, cur, pre, txs }) => {
        const isOpen = openCat === cat;
        return (
          <div key={cat} className="border-b border-gray-50 last:border-0">
            <div
              className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setOpenCat(isOpen ? null : cat)}
            >
              <span className="flex-1 text-sm text-gray-700">{cat}</span>
              <span
                className={`text-sm font-medium mr-3 ${type === "income" ? "text-blue-500" : "text-red-500"}`}
              >
                {formatAmount(cur)}
              </span>
              <Badge amount={calcChange(cur, pre)} type={type} />
              <span className="ml-2 text-gray-300 text-xs">
                {isOpen ? "▲" : "▼"}
              </span>
            </div>
            {isOpen && <TransactionList txs={txs} type={type} />}
          </div>
        );
      })}
    </div>
  );
}

export default function CategoryTable() {
  const { transactions, selectedYear, selectedMonth } = useTransactionStore();
  const monthly = getMonthTransactions(
    transactions,
    selectedYear,
    selectedMonth,
  );
  const isEmpty = monthly.length === 0;

  return (
    <CollapsibleSection title="카테고리별 내역" subtitle="지난달 대비 증감">
      {isEmpty ? (
        <div className="py-8 text-center text-sm text-gray-300">
          거래를 추가하면 카테고리별 내역이 표시됩니다
        </div>
      ) : (
        <div className="pb-2">
          <CategorySection
            title="수입"
            categories={INCOME_CATEGORIES}
            type="income"
          />
          <CategorySection
            title="지출"
            categories={EXPENSE_CATEGORIES}
            type="expense"
          />
        </div>
      )}
    </CollapsibleSection>
  );
}
