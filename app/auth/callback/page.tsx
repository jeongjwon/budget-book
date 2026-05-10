"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      const errorParam = new URLSearchParams(window.location.search).get("error");
      if (errorParam) {
        router.replace(`/login?error=${errorParam}`);
        return;
      }

      // The Supabase client automatically exchanges the PKCE code on initialization
      // (called from the constructor). We just await that here to catch any errors.
      const { error } = await supabase.auth.initialize();
      if (error) {
        router.replace("/login?error=callback_failed");
        return;
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
