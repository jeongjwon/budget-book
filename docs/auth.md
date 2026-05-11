# Authentication

## 인증 방식

OAuth 2.0 **PKCE (Proof Key for Code Exchange)** 플로우 사용.
`lib/supabase.ts`에서 `flowType: "pkce"` 로 설정.

## 지원 소셜 로그인

| Provider | 설정 위치 |
|---|---|
| Google | Supabase Dashboard → Auth → Providers |
| Kakao | Supabase Dashboard → Auth → Providers |

## 로그인 흐름

```
1. 사용자가 /login 에서 Google / Kakao 버튼 클릭
   └── supabase.auth.signInWithOAuth({ provider, redirectTo: /auth/callback })

2. OAuth Provider 인증 완료
   └── ?code=xxx 파라미터와 함께 /auth/callback 으로 리다이렉트

3. /auth/callback/page.tsx
   └── supabase.auth.initialize() await
       ├── Supabase 클라이언트가 URL의 ?code= 감지 → 자동으로 PKCE 코드 교환
       ├── 성공: getSession() → 세션 확인 → / 로 이동
       └── 실패: /login?error=callback_failed 로 이동
```

## 주의: PKCE 이중 교환 문제

Supabase JS v2는 클라이언트 초기화 시 `detectSessionInUrl: true`(기본값)로 동작한다.
URL에 `?code=` 파라미터가 있으면 **자동으로** PKCE 코드 교환을 수행한다.

콜백 페이지에서 `exchangeCodeForSession(code)`를 수동으로 한 번 더 호출하면
이미 소비된 코드를 재사용하려는 시도가 되어 `invalid_grant` 에러가 발생한다.

**올바른 처리:**
```ts
// app/auth/callback/page.tsx
await supabase.auth.initialize(); // 자동 교환 완료까지 대기
const { data: { session } } = await supabase.auth.getSession();
// 수동 exchangeCodeForSession 호출 금지
```

## 세션 관리

- 세션은 Supabase가 자동으로 갱신 (refresh token)
- 만료 시 자동 로그아웃
- `useTransactionStore`에서 `onAuthStateChange`로 세션 변화 감지:
  - `SIGNED_OUT` 이벤트: `user: null`로 초기화 → `/login` 리다이렉트

## 인증 상태 초기화

`useTransactionStore`는 클라이언트 사이드에서 생성될 때:
1. `supabase.auth.getSession()` 으로 현재 세션 확인
2. `onAuthStateChange` 리스너 등록
3. 인증 완료 전까지 `isAuthLoading: true` 유지 → 화면에 스피너 표시

## Row Level Security

Supabase RLS를 통해 DB 레벨에서 사용자 데이터를 격리한다.
모든 쿼리는 `auth.uid() = user_id` 조건을 통과해야 접근 가능하다.
