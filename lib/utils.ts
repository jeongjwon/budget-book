import { Transaction } from "@/types/transaction";

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay(); // 0=Sun
}

export function toDateString(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

export function formatMonthYear(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export function getMonthTransactions(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return transactions.filter((t) => t.date.startsWith(prefix));
}

export function getDayTransactions(
  transactions: Transaction[],
  dateStr: string,
): Transaction[] {
  return transactions.filter((t) => t.date === dateStr);
}

export function sumByType(
  transactions: Transaction[],
  type: "income" | "expense",
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function groupByDate(
  transactions: Transaction[],
): Record<string, Transaction[]> {
  return transactions.reduce(
    (acc, t) => {
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );
}

export function today(): string {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function getPrevMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function getNextMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export function calcChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(current - prev);
  // return Math.round(((current - prev) / prev) * 100);
}
