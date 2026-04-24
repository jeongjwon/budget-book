'use client';

import { useTransactionStore } from '@/store/useTransactionStore';

export default function TabBar() {
  const { activeTab, setActiveTab } = useTransactionStore();

  return (
    <div className="flex bg-gray-100 rounded-xl p-1 mx-4 mt-4">
      {(['calendar', 'list'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab === 'calendar' ? '📅 캘린더' : '📋 리스트'}
        </button>
      ))}
    </div>
  );
}
