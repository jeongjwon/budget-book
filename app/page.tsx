"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/store/useTransactionStore";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import CalendarView from "@/components/CalendarView";
import ListView from "@/components/ListView";
import MonthlySummary from "@/components/MonthlySummary";
import CategoryTable from "@/components/CategoryTable";
import Charts from "@/components/Charts";
import FrequentTransactions from "@/components/FrequentTransactions";
import TransactionModal from "@/components/TransactionModal";
import FloatingButton from "@/components/FloatingButton";

export default function Home() {
  const {
    activeTab,
    isModalOpen,
    fetchTransactions,
    isLoading,
    user,
    isAuthLoading,
  } = useTransactionStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading]);

  // Fetch transactions once the user is confirmed
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto pb-28">
        <MonthlySummary />
        <Charts />
        <CategoryTable />
        <FrequentTransactions />
        <TabBar />
        {activeTab === "calendar" ? <CalendarView /> : <ListView />}
      </main>
      <FloatingButton />
      {isModalOpen && <TransactionModal />}
    </div>
  );
}
