# Database Schema

## transactions

사용자의 수입/지출 거래 내역을 저장하는 테이블.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, default gen_random_uuid() | 거래 고유 ID |
| `user_id` | `uuid` | FK → auth.users(id), NOT NULL | 소유 유저 |
| `date` | `date` | NOT NULL | 거래 날짜 (YYYY-MM-DD) |
| `type` | `text` | NOT NULL, check in ('income','expense') | 수입/지출 구분 |
| `category` | `text` | NOT NULL | 카테고리 (앱 레벨 상수 참조) |
| `amount` | `integer` | NOT NULL, > 0 | 금액 (원 단위, 소수점 없음) |
| `memo` | `text` | nullable | 메모 |
| `created_at` | `timestamptz` | default now() | 생성 시각 |

```sql
CREATE TABLE transactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       date NOT NULL,
  type       text NOT NULL CHECK (type IN ('income', 'expense')),
  category   text NOT NULL,
  amount     integer NOT NULL CHECK (amount > 0),
  memo       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

---

## transaction_templates

자주 쓰는 거래를 저장해두는 템플릿 테이블. `date` 컬럼이 없는 것이 `transactions`와의 차이점.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, default gen_random_uuid() | 템플릿 고유 ID |
| `user_id` | `uuid` | FK → auth.users(id), NOT NULL | 소유 유저 |
| `type` | `text` | NOT NULL, check in ('income','expense') | 수입/지출 구분 |
| `category` | `text` | NOT NULL | 카테고리 |
| `amount` | `integer` | NOT NULL, > 0 | 금액 |
| `memo` | `text` | nullable | 메모 |
| `created_at` | `timestamptz` | default now() | 생성 시각 (정렬 기준) |

```sql
CREATE TABLE transaction_templates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('income', 'expense')),
  category   text NOT NULL,
  amount     integer NOT NULL CHECK (amount > 0),
  memo       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transaction_templates ENABLE ROW LEVEL SECURITY;
```

---

## 카테고리 목록

DB enum이 아닌 앱 레벨 상수(`types/transaction.ts`)로 관리한다.

**수입 (income)**
```
월급, 용돈, 부가수입
```

**지출 (expense)**
```
저금, 계비, 식비, 커피, 교통/통신/보험비, 생필품, 가족,
데이트비, 카드비, 꾸밈비, 유흥, 구독, 의료비, 선물, 여행, 기타
```
