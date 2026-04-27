export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = ["월급", "용돈", "부가수입"] as const;
export const EXPENSE_CATEGORIES = [
  "저금",
  "계비",
  "경조사비",
  "식비",
  "커피",
  "교통/통신/보험비",
  "생필품(편의점/다이소/마트/쿠팡)",
  "가족",
  "데이트비",
  "카드비",
  "꾸밈비",
  "유흥",
  "구독",
  "의료비",
  "선물",
  "여행",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: Category;
  amount: number;
  memo?: string;
}

export interface TransactionTemplate {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  memo?: string;
}
