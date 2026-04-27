"use client";

import { useState, useEffect } from "react";
import { TransactionTemplate } from "@/types/transaction";

const STORAGE_KEY = "budget_book_templates";

export function useTemplates() {
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch {
        // ignore corrupted data
      }
    }
  }, []);

  const persist = (list: TransactionTemplate[]) => {
    setTemplates(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addTemplate = (t: Omit<TransactionTemplate, "id">) => {
    persist([...templates, { ...t, id: crypto.randomUUID() }]);
  };

  const updateTemplate = (id: string, data: Omit<TransactionTemplate, "id">) => {
    persist(templates.map((t) => (t.id === id ? { ...data, id } : t)));
  };

  const removeTemplate = (id: string) => {
    persist(templates.filter((t) => t.id !== id));
  };

  return { templates, addTemplate, updateTemplate, removeTemplate };
}
