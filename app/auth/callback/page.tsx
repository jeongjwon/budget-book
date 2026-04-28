"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorParam = params.get("error");

      if (errorParam) {
        router.replace(`/login?error=${errorParam}`);
        return;
      }

      if (code) {
        // Kakao OAuth — PKCE code exchange
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login?error=callback_failed");
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      router.replace(session ? "/" : "/login?error=no_session");
    };

    handle();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">로그인 중...</p>
      </div>
    </div>
  );
}
