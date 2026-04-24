'use client';

import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import CalendarView from '@/components/CalendarView';
import ListView from '@/components/ListView';
import MonthlySummary from '@/components/MonthlySummary';
import CategoryTable from '@/components/CategoryTable';
import Charts from '@/components/Charts';
import TransactionModal from '@/components/TransactionModal';
import FloatingButton from '@/components/FloatingButton';

export default function Home() {
  const { activeTab, isModalOpen } = useTransactionStore();

  // Prevent hydration mismatch from localStorage persistence
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto pb-28">
        <MonthlySummary />
        <TabBar />
        {activeTab === 'calendar' ? <CalendarView /> : <ListView />}
        <CategoryTable />
        <Charts />
      </main>
      <FloatingButton />
      {isModalOpen && <TransactionModal />}
    </div>
  );
}
