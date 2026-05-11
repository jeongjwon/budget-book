# Data Layer

## 구조 개요

서버 상태와 클라이언트 상태를 명확하게 분리한다.

| 분류 | 도구 | 담당 데이터 |
|---|---|---|
| 서버 상태 | TanStack Query | 거래 내역, 템플릿 (DB에서 오는 데이터) |
| 클라이언트 상태 | Zustand | 선택 년/월, 활성 탭, 모달, 로그인 유저 |

## TanStack Query 설정

`providers/QueryProvider.tsx`

```ts
new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 }, // 1분간 캐시 유효
  },
})
```

## 거래 내역 훅 (`hooks/useTransactions.ts`)

### useTransactionsQuery
- 로그인한 유저의 전체 거래 내역을 날짜 내림차순으로 조회
- `enabled: !!user` — 비로그인 시 쿼리 실행 안 함
- 쿼리 키: `["transactions"]`

### useAddTransaction
- 새 거래 삽입 후 `setQueryData`로 캐시 앞에 추가 (서버 재요청 없음)

### useUpdateTransaction
- `{ id, updates }` 를 받아 DB 업데이트 후 캐시에서 해당 항목 교체

### useRemoveTransaction
- `id`를 받아 DB 삭제 후 캐시에서 필터링으로 제거

## 템플릿 훅 (`hooks/useTemplates.ts`)

`useTemplates()`가 하나의 훅에서 query + 3개 mutation을 모두 반환한다.

```ts
const { templates, loading, addTemplate, updateTemplate, removeTemplate } = useTemplates();
```

- `addTemplate(t)` → 캐시 끝에 추가
- `updateTemplate(id, data)` → 캐시에서 해당 항목 교체
- `removeTemplate(id)` → 캐시에서 필터링으로 제거

## Zustand 스토어 (`store/useTransactionStore.ts`)

서버 데이터를 전혀 포함하지 않는다. UI 관련 상태만 관리한다.

```ts
// UI 상태
selectedYear, selectedMonth   // 현재 보고 있는 월
activeTab                     // "calendar" | "list"
isModalOpen                   // 거래 추가/수정 모달
editingTransaction            // 수정 중인 거래 (null = 새 거래)
prefillTransaction            // 퀵 템플릿에서 온 입력값 사전 입력
defaultDate                   // 모달 기본 날짜

// 인증 상태
user                          // Supabase User 객체
isAuthLoading                 // 세션 확인 중 여부
```

## 캐시 업데이트 전략

서버 재요청(`invalidateQueries`) 대신 `setQueryData`로 직접 캐시를 수정한다.
뮤테이션 성공 시 즉시 UI에 반영되므로 체감 응답 속도가 빠르다.

```
mutation 성공
  → onSuccess: setQueryData(QUERY_KEY, updater)
    → 해당 쿼리를 구독하는 모든 컴포넌트 리렌더링
```

실패 시에는 캐시가 변경되지 않으므로 별도 롤백 로직이 필요 없다.
