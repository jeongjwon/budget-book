'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { getMonthTransactions, sumByType, formatAmount } from '@/lib/utils';

export default function MonthlySummary() {
  const { transactions, selectedYear, selectedMonth } = useTransactionStore();
  const monthly = getMonthTransactions(transactions, selectedYear, selectedMonth);

  const income = sumByType(monthly, 'income');
  const expense = sumByType(monthly, 'expense');
  const net = income - expense;

  return (
    <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-gray-400 mb-1">총 수입</p>
          <p className="text-base font-bold text-blue-500">{formatAmount(income)}</p>
        </div>
        <div className="border-x border-gray-100">
          <p className="text-xs text-gray-400 mb-1">총 지출</p>
          <p className="text-base font-bold text-red-500">{formatAmount(expense)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">순이익</p>
          <p className={`text-base font-bold ${net >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
            {net >= 0 ? '+' : ''}
            {formatAmount(net)}
          </p>
        </div>
      </div>
    </div>
  );
}
