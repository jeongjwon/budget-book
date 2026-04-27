"use client";

import { useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { formatMonthYear, getPrevMonth, getNextMonth } from "@/lib/utils";

export default function Header() {
  const { selectedYear, selectedMonth, setMonth, user, signOut } =
    useTransactionStore();
  const [showMenu, setShowMenu] = useState(false);

  const goToPrev = () => {
    const { year, month } = getPrevMonth(selectedYear, selectedMonth);
    setMonth(year, month);
  };

  const goToNext = () => {
    const { year, month } = getNextMonth(selectedYear, selectedMonth);
    setMonth(year, month);
  };

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOut();
  };

  const displayName: string =
    (user?.user_metadata?.full_name as string) ??
    (user?.user_metadata?.name as string) ??
    user?.email?.split("@")[0] ??
    "사용자";

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = displayName[0]?.toUpperCase() ?? "U";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={goToPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 text-xl transition-colors"
          aria-label="이전 달"
        >
          ‹
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {formatMonthYear(selectedYear, selectedMonth)}
        </h1>

        {/* User avatar + logout menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-100 hover:border-indigo-300 transition-colors flex items-center justify-center bg-indigo-100 text-indigo-700 text-sm font-bold"
            aria-label="사용자 메뉴"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {displayName}
                  </p>
                  {user?.email && !user.email.includes("naver.local") && (
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2.5 text-sm text-red-500 text-left hover:bg-red-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
