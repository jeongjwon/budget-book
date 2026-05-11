# Architecture

## 전체 구조

```
Browser
  └── Next.js 16 (App Router)
        ├── app/                  # 페이지 라우팅
        │     ├── page.tsx        # 메인 대시보드
        │     ├── login/          # 로그인 페이지
        │     └── auth/callback/  # OAuth 콜백 처리
        ├── components/           # UI 컴포넌트
        ├── hooks/                # 서버 상태 훅 (TanStack Query)
        ├── store/                # 클라이언트 상태 (Zustand)
        ├── providers/            # QueryClientProvider 래퍼
        ├── lib/                  # Supabase 클라이언트, 유틸
        └── types/                # TypeScript 타입 정의

Supabase (BaaS)
  ├── PostgreSQL DB     # 데이터 저장
  ├── Auth              # OAuth 인증 (Google, Kakao)
  └── RLS               # Row Level Security (사용자별 데이터 격리)
```

## 레이어별 역할

### Presentation Layer (`components/`)
- 순수 UI 렌더링 담당
- 상태는 훅과 스토어에서 주입받음
- 직접 Supabase를 호출하지 않음

### Server State Layer (`hooks/`)
- TanStack Query로 서버 데이터(거래, 템플릿) 캐싱·재검증 담당
- `useTransactionsQuery`, `useAddTransaction`, `useUpdateTransaction`, `useRemoveTransaction`
- `useTemplates` (query + mutation 포함)
- `staleTime: 60s` 기본값으로 불필요한 재요청 방지

### Client State Layer (`store/`)
- Zustand로 UI 상태만 관리
- 선택된 년/월, 활성 탭, 모달 열림 여부, 편집 중인 거래, 로그인 유저
- 서버 데이터(거래 목록)는 포함하지 않음

### BaaS Layer (`lib/supabase.ts`)
- `@supabase/supabase-js` 단일 클라이언트 인스턴스
- `flowType: "pkce"` 설정으로 PKCE 기반 인증

## 데이터 흐름

```
User Action
  → Component (UI 이벤트)
    → TanStack Query mutation (서버 쓰기)
      → Supabase DB
        → onSuccess: 캐시 업데이트 (setQueryData)
          → Component 리렌더링
```

읽기 경로:
```
Component mount
  → useTransactionsQuery (enabled: !!user)
    → Supabase SELECT
      → 캐시에 저장 (staleTime: 60s 동안 재요청 없음)
        → 모든 컴포넌트에 공유
```
