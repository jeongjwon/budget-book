"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types/transaction";
import { useTransactionStore } from "@/store/useTransactionStore";

const QUERY_KEY = ["transactions"];

export function useTransactionsQuery() {
  const user = useTransactionStore((s) => s.user);

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const user = useTransactionStore((s) => s.user);

  return useMutation({
    mutationFn: async (tx: Omit<Transaction, "id">) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...tx, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: (newTx) => {
      queryClient.setQueryData<Transaction[]>(QUERY_KEY, (prev = []) => [
        newTx,
        ...prev,
      ]);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Omit<Transaction, "id"> }) => {
      const { error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return { id, updates };
    },
    onSuccess: ({ id, updates }) => {
      queryClient.setQueryData<Transaction[]>(QUERY_KEY, (prev = []) =>
        prev.map((t) => (t.id === id ? { ...updates, id } : t)),
      );
    },
  });
}

export function useRemoveTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Transaction[]>(QUERY_KEY, (prev = []) =>
        prev.filter((t) => t.id !== id),
      );
    },
  });
}
