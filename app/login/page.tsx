"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTransactionStore } from "@/store/useTransactionStore";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useTransactionStore();

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/");
    }
  }, [user, isAuthLoading]);

  const handleKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  };

  const handleNaver = () => {
    window.location.href = "/api/auth/naver";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">가</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">가계부</h1>
          <p className="text-sm text-gray-400 mt-1">
            수입과 지출을 한눈에 관리하세요
          </p>
        </div>

        {/* Login buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleKakao}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: "#FEE500", color: "#000000CC" }}
          >
            <KakaoIcon />
            카카오로 시작하기
          </button>

          <button
            onClick={handleNaver}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all active:scale-95"
            style={{ backgroundColor: "#03C75A" }}
          >
            <NaverIcon />
            네이버로 시작하기
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-8 leading-relaxed">
          로그인하면 내 거래 내역이 안전하게 저장돼요
        </p>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.38c0 2.088 1.314 3.924 3.312 4.986l-.846 3.156c-.072.264.198.474.432.324L8.1 13.71c.294.03.594.048.9.048 4.142 0 7.5-2.634 7.5-5.88S13.142 1.5 9 1.5z"
        fill="#000000CC"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M9.12 8.267L6.72 4.5H4.5v7h2.38V7.733L9.28 11.5H11.5v-7H9.12v3.767z"
        fill="white"
      />
    </svg>
  );
}
