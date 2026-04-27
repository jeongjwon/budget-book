"use client";

import { create } from "zustand";
import { Transaction } from "@/types/transaction";
import { today } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface TransactionStore {
  transactions: Transaction[];
  selectedYear: number;
  selectedMonth: number;
  activeTab: "calendar" | "list";
  isModalOpen: boolean;
  isLoading: boolean;
  editingTransaction: Transaction | null;
  prefillTransaction: Partial<Omit<Transaction, "id" | "date">> | null;
  defaultDate: string;
  user: User | null;
  isAuthLoading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Omit<Transaction, "id">,
  ) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  setMonth: (year: number, month: number) => void;
  setActiveTab: (tab: "calendar" | "list") => void;
  setModalOpen: (open: boolean) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setDefaultDate: (date: string) => void;
  openModalForDate: (date: string) => void;
  openModalWithPrefill: (data: Partial<Omit<Transaction, "id" | "date">>) => void;
  clearPrefill: () => void;
  signOut: () => Promise<void>;
}

const now = new Date();

export const useTransactionStore = create<TransactionStore>((set, get) => {
  // Initialize auth state and listen for changes
  if (typeof window !== "undefined") {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isAuthLoading: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, isAuthLoading: false });
    });
  }

  return {
    transactions: [],
    selectedYear: now.getFullYear(),
    selectedMonth: now.getMonth() + 1,
    activeTab: "calendar",
    isModalOpen: false,
    isLoading: false,
    editingTransaction: null,
    prefillTransaction: null,
    defaultDate: today(),
    user: null,
    isAuthLoading: true,

    fetchTransactions: async () => {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data) {
        set({ transactions: data as Transaction[] });
      }
      set({ isLoading: false });
    },

    addTransaction: async (tx) => {
      const user = get().user;
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...tx, user_id: user.id })
        .select()
        .single();

      if (!error && data) {
        set((state) => ({
          transactions: [...state.transactions, data as Transaction],
        }));
      }
    },

    updateTransaction: async (id, updates) => {
      const { error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id);

      if (!error) {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...updates, id } : t,
          ),
        }));
      }
    },

    removeTransaction: async (id) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);

      if (!error) {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      }
    },

    setMonth: (year, month) => set({ selectedYear: year, selectedMonth: month }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setModalOpen: (open) => set({ isModalOpen: open }),
    setEditingTransaction: (tx) => set({ editingTransaction: tx }),
    setDefaultDate: (date) => set({ defaultDate: date }),
    openModalForDate: (date) =>
      set({ defaultDate: date, isModalOpen: true, editingTransaction: null, prefillTransaction: null }),
    openModalWithPrefill: (data) =>
      set({ prefillTransaction: data, isModalOpen: true, editingTransaction: null }),
    clearPrefill: () => set({ prefillTransaction: null }),

    signOut: async () => {
      await supabase.auth.signOut();
      set({ transactions: [], user: null });
    },
  };
});
