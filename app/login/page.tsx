"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTransactionStore } from "@/store/useTransactionStore";
import pigLogo from "../pig.png";

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

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
            <Image
              src={pigLogo}
              alt="Piggy Book Logo"
              width={64}
              height={64}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">가계부</h1>
          <p className="text-sm text-gray-400 mt-1">
            수입과 지출을 한눈에 관리하세요
          </p>
        </div>

        {/* Login buttons */}
        <div className="flex flex-col gap-3">
          {/* 구글 로그인 */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm text-gray-700 bg-white border border-gray-200 shadow-sm transition-all active:scale-95"
          >
            <GoogleIcon />
            구글로 시작하기
          </button>

          {/* 카카오 로그인 */}
          {/* <button
            onClick={handleKakao}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: "#FEE500", color: "#000000CC" }}
          >
            <KakaoIcon />
            카카오로 시작하기
          </button> */}

          <div
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: "#FEE500", color: "#000000CC" }}
          >
            <KakaoIcon />
            카카오로 시작하기 (준비중)
          </div>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
