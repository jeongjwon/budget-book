'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { getMonthTransactions, groupByDate, formatAmount, sumByType } from '@/lib/utils';
import { Transaction } from '@/types/transaction';

const TYPE_COLOR: Record<string, string> = {
  income: 'text-blue-500',
  expense: 'text-red-500',
};

export default function ListView() {
  const {
    transactions,
    selectedYear,
    selectedMonth,
    removeTransaction,
    setEditingTransaction,
    setModalOpen,
  } = useTransactionStore();

  // Track collapsed date groups (default: all expanded)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const monthly = getMonthTransactions(transactions, selectedYear, selectedMonth);
  const grouped = groupByDate(monthly);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const isExpanded = (date: string) => !collapsedDates.has(date);

  const toggleDate = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  if (sortedDates.length === 0) {
    return (
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
        이번 달 거래 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 flex flex-col gap-3">
      {sortedDates.map((dateStr) => {
        const dayTxs = grouped[dateStr].sort((a, b) => b.amount - a.amount);
        const [, , day] = dateStr.split('-');
        const dow = new Date(dateStr).toLocaleDateString('ko-KR', { weekday: 'short' });
        const dayInc = sumByType(dayTxs, 'income');
        const dayExp = sumByType(dayTxs, 'expense');
        const expanded = isExpanded(dateStr);

        return (
          <div key={dateStr} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Date header — clickable to toggle */}
            <button
              className="w-full px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-left"
              onClick={() => toggleDate(dateStr)}
            >
              <span className="text-sm font-bold text-gray-700">{Number(day)}일</span>
              <span className="text-xs text-gray-400">{dow}</span>
              <div className="ml-auto flex items-center gap-2">
                {dayInc > 0 && (
                  <span className="text-xs font-semibold text-blue-500">
                    +{formatAmount(dayInc)}
                  </span>
                )}
                {dayExp > 0 && (
                  <span className="text-xs font-semibold text-red-400">
                    -{formatAmount(dayExp)}
                  </span>
                )}
                {/* Chevron */}
                <span
                  className={`text-gray-400 text-[10px] transition-transform duration-200 ml-1 ${
                    expanded ? 'rotate-0' : '-rotate-90'
                  }`}
                  style={{ display: 'inline-block' }}
                >
                  ▼
                </span>
              </div>
            </button>

            {/* Collapsible transaction list */}
            {expanded && (
              <ul>
                {dayTxs.map((tx, i) => (
                  <li
                    key={tx.id}
                    className={`flex items-center px-4 py-3 gap-3 ${
                      i !== 0 ? 'border-t border-gray-50' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{tx.category}</p>
                      {tx.memo && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{tx.memo}</p>
                      )}
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${TYPE_COLOR[tx.type]}`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </span>
                    <button
                      onClick={() => openEdit(tx)}
                      className="text-gray-300 hover:text-indigo-400 transition-colors text-sm leading-none flex-shrink-0"
                      aria-label="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
                      aria-label="삭제"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
