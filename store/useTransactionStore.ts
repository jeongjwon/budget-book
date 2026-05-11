"use client";

import { create } from "zustand";
import { Transaction } from "@/types/transaction";
import { today } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface TransactionStore {
  selectedYear: number;
  selectedMonth: number;
  activeTab: "calendar" | "list";
  isModalOpen: boolean;
  editingTransaction: Transaction | null;
  prefillTransaction: Partial<Omit<Transaction, "id" | "date">> | null;
  defaultDate: string;
  user: User | null;
  isAuthLoading: boolean;
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

export const useTransactionStore = create<TransactionStore>((set) => {
  if (typeof window !== "undefined") {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isAuthLoading: false });
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        set({ user: null, isAuthLoading: false });
      } else {
        set({ user: session?.user ?? null, isAuthLoading: false });
      }
    });
  }

  return {
    selectedYear: now.getFullYear(),
    selectedMonth: now.getMonth() + 1,
    activeTab: "calendar",
    isModalOpen: false,
    editingTransaction: null,
    prefillTransaction: null,
    defaultDate: today(),
    user: null,
    isAuthLoading: true,

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
      set({ user: null });
    },
  };
});
