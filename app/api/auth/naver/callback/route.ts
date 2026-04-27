import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("naver_oauth_state")?.value;
  cookieStore.delete("naver_oauth_state");

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  // Exchange code for Naver access token
  const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.NAVER_CLIENT_ID!,
      client_secret: process.env.NAVER_CLIENT_SECRET!,
      code,
      redirect_uri: `${appUrl}/api/auth/naver/callback`,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${appUrl}/login?error=naver_token_failed`);
  }

  // Get Naver user profile
  const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profileData = await profileRes.json();
  const naverUser = profileData.response;

  if (!naverUser?.id) {
    return NextResponse.redirect(`${appUrl}/login?error=naver_profile_failed`);
  }

  const email = naverUser.email ?? `naver_${naverUser.id}@naver.local`;
  const displayName = naverUser.name ?? naverUser.nickname ?? "네이버 사용자";
  const avatarUrl: string | undefined = naverUser.profile_image;

  // Find existing Supabase user by Naver ID stored in metadata
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const existing = users.find(
    (u) => u.user_metadata?.naver_id === naverUser.id || u.email === email,
  );

  if (existing) {
    // Update metadata to keep it fresh
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      user_metadata: {
        ...existing.user_metadata,
        naver_id: naverUser.id,
        full_name: displayName,
        avatar_url: avatarUrl,
        provider: "naver",
      },
    });
  } else {
    // Create new Supabase user
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        naver_id: naverUser.id,
        full_name: displayName,
        avatar_url: avatarUrl,
        provider: "naver",
      },
    });
    if (error) {
      return NextResponse.redirect(`${appUrl}/login?error=create_user_failed`);
    }
  }

  // Generate a magic link to sign the user in
  // Note: Supabase will also send a magic link email — disable the
  // "Magic Link" email template in Supabase > Auth > Email Templates
  // if you don't want users to receive it.
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${appUrl}/auth/callback` },
    });

  if (linkError || !linkData.properties.action_link) {
    return NextResponse.redirect(`${appUrl}/login?error=session_failed`);
  }

  return NextResponse.redirect(linkData.properties.action_link);
}
