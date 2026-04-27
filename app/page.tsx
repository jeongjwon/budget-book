"use client";

import { useEffect, useState } from "react";
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
  const { activeTab, isModalOpen, fetchTransactions, isLoading } =
    useTransactionStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  if (!mounted) return null;

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
        <Charts /> {/* 월별 수입/지출 흐름 */}
        <CategoryTable /> {/* 카테고리별 내역 */}
        <FrequentTransactions /> {/* 자주 쓰는 거래 */}
        <TabBar />
        {activeTab === "calendar" ? <CalendarView /> : <ListView />}
      </main>
      <FloatingButton />
      {isModalOpen && <TransactionModal />}
    </div>
  );
}
