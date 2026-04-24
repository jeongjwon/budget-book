'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { formatMonthYear, getPrevMonth, getNextMonth } from '@/lib/utils';

export default function Header() {
  const { selectedYear, selectedMonth, setMonth } = useTransactionStore();

  const goToPrev = () => {
    const { year, month } = getPrevMonth(selectedYear, selectedMonth);
    setMonth(year, month);
  };

  const goToNext = () => {
    const { year, month } = getNextMonth(selectedYear, selectedMonth);
    setMonth(year, month);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={goToPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 text-xl transition-colors"
          aria-label="이전 달"
        >
          ‹
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {formatMonthYear(selectedYear, selectedMonth)}
        </h1>
        <button
          onClick={goToNext}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 text-xl transition-colors"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>
    </header>
  );
}
