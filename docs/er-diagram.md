# ER Diagram

## 다이어그램

```
┌─────────────────────┐
│     auth.users      │  (Supabase 관리)
├─────────────────────┤
│ id (uuid) PK        │
│ email               │
│ user_metadata       │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────┴──────────┐       ┌──────────────────────────┐
│    transactions     │       │   transaction_templates   │
├─────────────────────┤       ├──────────────────────────┤
│ id (uuid) PK        │       │ id (uuid) PK              │
│ user_id (uuid) FK ──┼───────┤ user_id (uuid) FK         │
│ date                │       │ type                      │
│ type                │       │ category                  │
│ category            │       │ amount                    │
│ amount              │       │ memo                      │
│ memo                │       │ created_at                │
│ created_at          │       └──────────────────────────┘
└─────────────────────┘
```

## 관계 설명

- `auth.users` 1 : N `transactions` — 한 유저는 여러 거래를 가진다
- `auth.users` 1 : N `transaction_templates` — 한 유저는 여러 템플릿을 가진다
- `transactions`와 `transaction_templates`는 직접적인 관계 없음
  - 템플릿은 거래를 빠르게 입력하기 위한 사전 설정일 뿐, FK로 연결되지 않는다

## `transactions` vs `transaction_templates` 차이

| 항목 | transactions | transaction_templates |
|---|---|---|
| `date` 컬럼 | O (언제 발생했는지) | X (날짜 무관) |
| 목적 | 실제 거래 기록 | 반복 거래 퀵 입력용 |
| 생성 주체 | 사용자가 직접 입력 | 사용자가 템플릿으로 등록 |
| 사용 방식 | 대시보드·차트에 집계됨 | 클릭 시 `transactions` 입력 모달에 사전 입력 |

## RLS 정책 요약

두 테이블 모두 `auth.uid() = user_id` 조건으로 자신의 행만 접근 가능하다.

```
SELECT  → auth.uid() = user_id
INSERT  → auth.uid() = user_id (with check)
UPDATE  → auth.uid() = user_id
DELETE  → auth.uid() = user_id
```
