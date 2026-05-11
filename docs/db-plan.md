# DB 설계 계획

## 테이블 목록

| 테이블 | 역할 |
|---|---|
| `transactions` | 사용자의 수입/지출 거래 기록 |
| `transaction_templates` | 자주 쓰는 거래 템플릿 |

Supabase Auth가 관리하는 `auth.users` 테이블은 직접 건드리지 않는다.

## 설계 원칙

### 1. RLS 우선
테이블 생성과 동시에 RLS 정책을 적용한다.
`auth.uid() = user_id` 조건으로 자신의 데이터에만 접근 가능하다.

### 2. user_id 외래키
`auth.users(id)` 를 참조하는 `user_id` 컬럼을 모든 테이블에 포함한다.
Supabase Auth와 연동되어 로그인한 유저 기준으로 데이터가 격리된다.

### 3. 단순한 스키마 유지
카테고리는 DB enum이 아닌 애플리케이션 레벨 상수(`types/transaction.ts`)로 관리한다.
카테고리 추가/변경 시 마이그레이션 없이 코드 수정만으로 대응할 수 있다.

### 4. 소프트 딜리트 없음
거래 삭제는 실제 DELETE를 사용한다.
가계부 특성상 실수 복구보다 단순성을 우선한다.

## RLS 정책 (공통)

아래 정책을 `transactions`, `transaction_templates` 테이블 모두에 적용한다.

```sql
-- SELECT
CREATE POLICY "Users can view own data"
ON [table] FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert own data"
ON [table] FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own data"
ON [table] FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete own data"
ON [table] FOR DELETE
USING (auth.uid() = user_id);
```

## 인덱스 고려사항

- `transactions.user_id` — 사용자별 전체 조회에 사용 (RLS와 함께 자동 필터)
- `transactions.date` — 월별 필터링에 사용 (현재는 앱 레벨에서 처리)
- 데이터 규모가 커지면 `(user_id, date)` 복합 인덱스 추가를 고려한다
