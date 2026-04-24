'use client';

import { useTransactionStore } from '@/store/useTransactionStore';

export default function FloatingButton() {
  const { setModalOpen } = useTransactionStore();

  return (
    <button
      onClick={() => setModalOpen(true)}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 shadow-lg shadow-indigo-300 text-white text-3xl flex items-center justify-center transition-all"
      aria-label="거래 추가"
    >
      +
    </button>
  );
}
