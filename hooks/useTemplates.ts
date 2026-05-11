"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionTemplate } from "@/types/transaction";
import { supabase } from "@/lib/supabase";

const QUERY_KEY = ["templates"];

export function useTemplates() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_templates")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TransactionTemplate[];
    },
  });

  const addTemplate = useMutation({
    mutationFn: async (t: Omit<TransactionTemplate, "id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("transaction_templates")
        .insert([{ ...t, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data as TransactionTemplate;
    },
    onSuccess: (newTemplate) => {
      queryClient.setQueryData<TransactionTemplate[]>(QUERY_KEY, (prev = []) => [
        ...prev,
        newTemplate,
      ]);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<TransactionTemplate, "id"> }) => {
      const { error } = await supabase
        .from("transaction_templates")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      return { id, data };
    },
    onSuccess: ({ id, data }) => {
      queryClient.setQueryData<TransactionTemplate[]>(QUERY_KEY, (prev = []) =>
        prev.map((t) => (t.id === id ? { ...data, id } : t)),
      );
    },
  });

  const removeTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transaction_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<TransactionTemplate[]>(QUERY_KEY, (prev = []) =>
        prev.filter((t) => t.id !== id),
      );
    },
  });

  return {
    templates,
    loading,
    addTemplate: (t: Omit<TransactionTemplate, "id">) => addTemplate.mutate(t),
    updateTemplate: (id: string, data: Omit<TransactionTemplate, "id">) =>
      updateTemplate.mutate({ id, data }),
    removeTemplate: (id: string) => removeTemplate.mutate(id),
  };
}
