'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/types/transaction';
import { today } from '@/lib/utils';

interface TransactionStore {
  transactions: Transaction[];
  selectedYear: number;
  selectedMonth: number;
  activeTab: 'calendar' | 'list';
  isModalOpen: boolean;
  editingTransaction: Transaction | null;
  defaultDate: string;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  setMonth: (year: number, month: number) => void;
  setActiveTab: (tab: 'calendar' | 'list') => void;
  setModalOpen: (open: boolean) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setDefaultDate: (date: string) => void;
  openModalForDate: (date: string) => void;
}

const now = new Date();

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1,
      activeTab: 'calendar',
      isModalOpen: false,
      editingTransaction: null,
      defaultDate: today(),
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [...state.transactions, { ...tx, id: crypto.randomUUID() }],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...updates, id } : t)),
        })),
      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      setMonth: (year, month) => set({ selectedYear: year, selectedMonth: month }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setModalOpen: (open) => set({ isModalOpen: open }),
      setEditingTransaction: (tx) => set({ editingTransaction: tx }),
      setDefaultDate: (date) => set({ defaultDate: date }),
      openModalForDate: (date) => set({ defaultDate: date, isModalOpen: true, editingTransaction: null }),
    }),
    {
      name: 'budget-book-v1',
      // defaultDate는 localStorage에 저장하지 않음
      partialize: (state) => ({
        transactions: state.transactions,
        selectedYear: state.selectedYear,
        selectedMonth: state.selectedMonth,
        activeTab: state.activeTab,
      }),
    },
  ),
);
