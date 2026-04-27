'use client';

import { useState, useEffect, useRef } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  TransactionType,
  Category,
} from '@/types/transaction';
import { today } from '@/lib/utils';

export default function TransactionModal() {
  const {
    addTransaction,
    updateTransaction,
    setModalOpen,
    editingTransaction,
    setEditingTransaction,
    prefillTransaction,
    clearPrefill,
    defaultDate,
    setDefaultDate,
  } = useTransactionStore();

  const isEdit = !!editingTransaction;
  const prefill = isEdit ? null : prefillTransaction;

  const [date, setDate] = useState(editingTransaction?.date ?? defaultDate);
  const [type, setType] = useState<TransactionType>(
    editingTransaction?.type ?? prefill?.type ?? 'expense',
  );
  const [category, setCategory] = useState<Category>(
    editingTransaction?.category ?? prefill?.category ?? EXPENSE_CATEGORIES[0],
  );
  const [amount, setAmount] = useState(
    editingTransaction
      ? editingTransaction.amount.toLocaleString('ko-KR')
      : prefill?.amount
        ? prefill.amount.toLocaleString('ko-KR')
        : '',
  );
  const [memo, setMemo] = useState(editingTransaction?.memo ?? prefill?.memo ?? '');
  const [error, setError] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Skip the first run so prefilled category is preserved on mount
  const skipTypeReset = useRef(true);
  useEffect(() => {
    if (skipTypeReset.current) {
      skipTypeReset.current = false;
      return;
    }
    if (!isEdit) setCategory(categories[0]);
  }, [type]);

  const handleClose = () => {
    setEditingTransaction(null);
    setDefaultDate(today());
    setModalOpen(false);
    clearPrefill();
  };

  const handleSubmit = () => {
    const parsed = Number(amount.replace(/,/g, ''));
    if (!date) return setError('날짜를 선택해주세요.');
    if (isNaN(parsed) || parsed <= 0) return setError('올바른 금액을 입력해주세요.');

    const payload = { date, type, category, amount: parsed, memo: memo.trim() || undefined };

    if (isEdit) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    handleClose();
  };

  const handleAmountChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, '');
    setAmount(digits ? Number(digits).toLocaleString('ko-KR') : '');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? '거래 수정' : '거래 추가'}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Type toggle */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">대분류</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(['income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    type === t
                      ? t === 'income'
                        ? 'bg-blue-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {t === 'income' ? '수입' : '지출'}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">소분류</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">금액</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                원
              </span>
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              메모 <span className="text-gray-300">(선택)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="간단한 메모를 남겨보세요"
              maxLength={50}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors ${
              type === 'income'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isEdit ? '수정하기' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
