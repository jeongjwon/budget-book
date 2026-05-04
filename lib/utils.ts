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

export function downloadMonthlyReport(
  transactions: Transaction[],
  year: number,
  month: number,
): void {
  const monthly = getMonthTransactions(transactions, year, month).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const totalIncome = sumByType(monthly, "income");
  const totalExpense = sumByType(monthly, "expense");

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};
  for (const t of monthly) {
    if (t.type === "income") {
      incomeByCategory[t.category] = (incomeByCategory[t.category] ?? 0) + t.amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] ?? 0) + t.amount;
    }
  }

  const incomeEntries = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]);
  const expenseEntries = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
  const byDate = groupByDate(monthly);
  const dailyEntries = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));

  const COLORS = [
    "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
    "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16",
    "#06b6d4","#a855f7","#64748b","#e11d48","#0ea5e9",
    "#d97706","#16a34a","#dc2626",
  ];

  function fmt(n: number): string {
    return n.toLocaleString("ko-KR") + "원";
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function makePieChart(entries: [string, number][], total: number): string {
    if (entries.length === 0) return `<p style="color:#94a3b8;font-size:13px">데이터 없음</p>`;
    const cx = 90, cy = 90, r = 80;
    const paths: string[] = [];
    const legendItems: string[] = [];
    let startAngle = 0;

    entries.forEach(([cat, amount], i) => {
      const sweep = (amount / total) * 360;
      const color = COLORS[i % COLORS.length];
      let pathEl: string;
      if (sweep >= 359.99) {
        pathEl = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
      } else {
        const s = polarToCartesian(cx, cy, r, startAngle);
        const e = polarToCartesian(cx, cy, r, startAngle + sweep);
        const large = sweep > 180 ? 1 : 0;
        pathEl = `<path d="M${cx},${cy} L${s.x.toFixed(1)},${s.y.toFixed(1)} A${r},${r} 0 ${large},1 ${e.x.toFixed(1)},${e.y.toFixed(1)} Z" fill="${color}"/>`;
      }
      paths.push(pathEl);
      const pct = Math.round((amount / total) * 100);
      legendItems.push(
        `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:5px">` +
        `<span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>` +
        `<span style="flex:1;color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${cat}</span>` +
        `<span style="font-weight:600;white-space:nowrap">${pct}%</span>` +
        `</div>`,
      );
      startAngle += sweep;
    });

    return (
      `<div style="display:flex;align-items:center;gap:16px">` +
      `<svg viewBox="0 0 180 180" width="160" height="160" style="flex-shrink:0">${paths.join("")}</svg>` +
      `<div style="flex:1;min-width:0">${legendItems.join("")}</div>` +
      `</div>`
    );
  }

  const net = totalIncome - totalExpense;
  const exportDate = new Date().toLocaleDateString("ko-KR");
  // </script> 가 데이터 안에 있으면 script 태그가 조기 종료되므로 이스케이프
  const embeddedJson = JSON.stringify(monthly).replace(/<\//g, "<\\/");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${year}년 ${month}월 가계부</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;background:#f8fafc;color:#1e293b;padding:28px;max-width:860px;margin:0 auto}
h1{font-size:22px;font-weight:700;margin-bottom:4px}
.sub{font-size:12px;color:#94a3b8;margin-bottom:24px}
.summary{display:flex;gap:12px;margin-bottom:20px}
.card{flex:1;background:#fff;border-radius:12px;padding:16px;border:1px solid #e2e8f0}
.card .lbl{font-size:11px;color:#94a3b8;margin-bottom:6px}
.card .amt{font-size:18px;font-weight:700}
.blue{color:#3b82f6}.red{color:#ef4444}.green{color:#10b981}
.section{background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:20px;margin-bottom:20px}
.sec-title{font-size:13px;font-weight:700;color:#64748b;margin-bottom:16px;text-transform:uppercase;letter-spacing:.04em}
.charts{display:flex;gap:32px}
.chart-col{flex:1;min-width:0}
.chart-col h3{font-size:13px;font-weight:600;color:#475569;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px 10px;background:#f1f5f9;color:#64748b;font-weight:600;font-size:11px;letter-spacing:.03em}
td{padding:9px 10px;border-bottom:1px solid #f1f5f9;color:#334155}
tr:last-child td{border-bottom:none}
.tr{text-align:right}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
.bi{background:#eff6ff;color:#3b82f6}.be{background:#fef2f2;color:#ef4444}
.memo{color:#94a3b8}
.csv-btn{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;transition:background .15s}
.csv-btn:hover{background:#e2e8f0}
</style>
<script>
const _rows = ${embeddedJson};
function downloadCSV() {
  function esc(v) { return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  const data = [
    ['날짜','유형','카테고리','금액(원)','메모'],
    ..._rows.map(function(t) {
      return [t.date, t.type==='income'?'수입':'지출', t.category, String(t.amount), t.memo||''];
    })
  ];
  const csv = '﻿' + data.map(function(r){ return r.map(esc).join(','); }).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}));
  a.download = '${year}년 ${month}월 가계부.csv';
  a.click();
}
</script>
</head>
<body>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
  <h1>${year}년 ${month}월 가계부</h1>
  <button class="csv-btn" onclick="downloadCSV()">CSV 다운로드</button>
</div>
<p class="sub">내보내기: ${exportDate}</p>

<div class="summary">
  <div class="card"><div class="lbl">수입</div><div class="amt blue">${fmt(totalIncome)}</div></div>
  <div class="card"><div class="lbl">지출</div><div class="amt red">${fmt(totalExpense)}</div></div>
  <div class="card"><div class="lbl">순수익</div><div class="amt ${net >= 0 ? "green" : "red"}">${fmt(net)}</div></div>
</div>

<div class="section">
  <div class="sec-title">카테고리별 분포</div>
  <div class="charts">
    <div class="chart-col"><h3>수입</h3>${makePieChart(incomeEntries, totalIncome)}</div>
    <div class="chart-col"><h3>지출</h3>${makePieChart(expenseEntries, totalExpense)}</div>
  </div>
</div>

<div class="section">
  <div class="sec-title">일별 내역</div>
  <table>
    <thead><tr><th>날짜</th><th class="tr">수입</th><th class="tr">지출</th><th class="tr">순수익</th></tr></thead>
    <tbody>
      ${dailyEntries.map(([date, txs]) => {
        const inc = sumByType(txs, "income");
        const exp = sumByType(txs, "expense");
        const n = inc - exp;
        return `<tr>
          <td>${date}</td>
          <td class="tr ${inc > 0 ? "blue" : ""}">${inc > 0 ? fmt(inc) : "-"}</td>
          <td class="tr ${exp > 0 ? "red" : ""}">${exp > 0 ? fmt(exp) : "-"}</td>
          <td class="tr ${n >= 0 ? "green" : "red"}">${fmt(n)}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>
</div>

<div class="section">
  <div class="sec-title">전체 거래내역</div>
  <table>
    <thead><tr><th>날짜</th><th>유형</th><th>카테고리</th><th class="tr">금액</th><th>메모</th></tr></thead>
    <tbody>
      ${monthly.map(t => {
        const isIncome = t.type === "income";
        return `<tr>
          <td>${t.date}</td>
          <td><span class="badge ${isIncome ? "bi" : "be"}">${isIncome ? "수입" : "지출"}</span></td>
          <td>${t.category}</td>
          <td class="tr ${isIncome ? "blue" : "red"}">${fmt(t.amount)}</td>
          <td class="memo">${t.memo ?? ""}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${year}년 ${month}월 가계부.html`;
  a.click();
  URL.revokeObjectURL(url);
}
