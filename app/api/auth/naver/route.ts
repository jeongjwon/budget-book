import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const state = crypto.randomUUID();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Store state in cookie for CSRF verification
  const cookieStore = await cookies();
  cookieStore.set("naver_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NAVER_CLIENT_ID!,
    redirect_uri: `${appUrl}/api/auth/naver/callback`,
    state,
  });

  return NextResponse.redirect(
    `https://nid.naver.com/oauth2.0/authorize?${params}`,
  );
}
