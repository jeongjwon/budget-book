"use client";

import { useState, useEffect } from "react";
import { TransactionTemplate } from "@/types/transaction";
import { supabase } from "@/lib/supabase";

export function useTemplates() {
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transaction_templates")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const addTemplate = async (t: Omit<TransactionTemplate, "id">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transaction_templates")
        .insert([{ ...t, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) setTemplates([...templates, data]);
    } catch (err) {
      console.error("Error adding template:", err);
    }
  };

  const updateTemplate = async (
    id: string,
    data: Omit<TransactionTemplate, "id">,
  ) => {
    try {
      const { error } = await supabase
        .from("transaction_templates")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      setTemplates(templates.map((t) => (t.id === id ? { ...data, id } : t)));
    } catch (err) {
      console.error("Error updating template:", err);
    }
  };

  const removeTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transaction_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error removing template:", err);
    }
  };

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    removeTemplate,
    refresh: fetchTemplates,
  };
}
