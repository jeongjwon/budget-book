'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  toDateString,
  getDayTransactions,
  sumByType,
  formatAmount,
  today,
} from '@/lib/utils';
import { Transaction } from '@/types/transaction';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function compactAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString('ko-KR');
}

function formatDayLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(dateStr).toLocaleDateString('ko-KR', { weekday: 'short' });
  return `${m}월 ${d}일 (${dow})`;
}

function DayDetailSheet({
  dateStr,
  txs,
  onClose,
}: {
  dateStr: string;
  txs: Transaction[];
  onClose: () => void;
}) {
  const { openModalForDate, setEditingTransaction, setModalOpen, removeTransaction } =
    useTransactionStore();

  const inc = sumByType(txs, 'income');
  const exp = sumByType(txs, 'expense');

  const handleAddForDay = () => {
    onClose();
    setTimeout(() => openModalForDate(dateStr), 50);
  };

  const handleEdit = (tx: Transaction) => {
    onClose();
    setTimeout(() => {
      setEditingTransaction(tx);
      setModalOpen(true);
    }, 50);
  };

  return (
    <>
      {/* Backdrop — z-40으로 FAB(z-30)을 덮음 */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Sheet panel — 전체 너비 배경, 내용물은 max-w-2xl 중앙 정렬 */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-sheet-up flex flex-col max-h-[65vh]">
        <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
            <div>
              <p className="text-base font-bold text-gray-800">{formatDayLabel(dateStr)}</p>
              <div className="flex gap-3 mt-1">
                {inc > 0 && (
                  <span className="text-xs font-semibold text-blue-500">
                    수입 +{formatAmount(inc)}
                  </span>
                )}
                {exp > 0 && (
                  <span className="text-xs font-semibold text-red-400">
                    지출 -{formatAmount(exp)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <button
                onClick={handleAddForDay}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-semibold rounded-full transition-colors"
              >
                <span className="text-sm leading-none">+</span> 추가
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Transaction list */}
          <ul className="overflow-y-auto flex-1 divide-y divide-gray-50 px-5 pb-safe">
            {txs.map((tx) => (
              <li key={tx.id} className="flex items-center py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{tx.category}</p>
                  {tx.memo && <p className="text-xs text-gray-400 mt-0.5 truncate">{tx.memo}</p>}
                </div>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${
                    tx.type === 'income' ? 'text-blue-500' : 'text-red-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatAmount(tx.amount)}
                </span>
                <button
                  onClick={() => handleEdit(tx)}
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm flex-shrink-0"
                  aria-label="수정"
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeTransaction(tx.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0"
                  aria-label="삭제"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default function CalendarView() {
  const { transactions, selectedYear, selectedMonth, openModalForDate } = useTransactionStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfWeek(selectedYear, selectedMonth);
  const todayStr = today();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedTxs = selectedDate ? getDayTransactions(transactions, selectedDate) : [];

  return (
    <>
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-xs font-medium ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[80px] border-b border-r border-gray-50"
                />
              );
            }

            const dateStr = toDateString(selectedYear, selectedMonth, day);
            const dayTxs = getDayTransactions(transactions, dateStr);
            const inc = sumByType(dayTxs, 'income');
            const exp = sumByType(dayTxs, 'expense');
            const hasTxs = dayTxs.length > 0;
            const isToday = dateStr === todayStr;
            const colIdx = idx % 7;

            return (
              <div
                key={dateStr}
                className="min-h-[80px] border-b border-r border-gray-50 p-1.5 flex flex-col cursor-pointer transition-colors hover:bg-indigo-50/40 active:bg-indigo-50/70 group"
                onClick={() => {
                  if (hasTxs) {
                    setSelectedDate(dateStr);
                  } else {
                    openModalForDate(dateStr);
                  }
                }}
              >
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 flex-shrink-0 ${
                    isToday
                      ? 'bg-indigo-500 text-white'
                      : colIdx === 0
                        ? 'text-red-400'
                        : colIdx === 6
                          ? 'text-blue-400'
                          : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
                {inc > 0 && (
                  <span className="text-[9px] text-blue-500 font-medium leading-tight truncate">
                    +{compactAmount(inc)}
                  </span>
                )}
                {exp > 0 && (
                  <span className="text-[9px] text-red-400 font-medium leading-tight truncate">
                    -{compactAmount(exp)}
                  </span>
                )}
                {!hasTxs && (
                  <span className="mt-auto text-center text-[10px] text-gray-200 group-hover:text-gray-300 transition-colors leading-none">
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 마지막 거래 삭제 시 selectedTxs.length === 0 → 시트 자동 닫힘 */}
      {selectedDate && selectedTxs.length > 0 && (
        <DayDetailSheet
          dateStr={selectedDate}
          txs={selectedTxs}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
