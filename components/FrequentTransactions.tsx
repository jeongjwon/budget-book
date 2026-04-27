"use client";

import { useState, useRef, useEffect } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import CollapsibleSection from "./CollapsibleSection";
import { useTemplates } from "@/hooks/useTemplates";
import {
  TransactionTemplate,
  TransactionType,
  Category,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/types/transaction";
import { formatAmount } from "@/lib/utils";

function TemplateFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: TransactionTemplate;
  onSave: (data: Omit<TransactionTemplate, "id">) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? EXPENSE_CATEGORIES[0],
  );
  const [amount, setAmount] = useState(
    initial?.amount ? initial.amount.toLocaleString("ko-KR") : "",
  );
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [error, setError] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const skipTypeReset = useRef(true);
  useEffect(() => {
    if (skipTypeReset.current) {
      skipTypeReset.current = false;
      return;
    }
    setCategory(categories[0]);
  }, [type]);

  const handleSave = () => {
    const parsed = Number(amount.replace(/,/g, ""));
    if (isNaN(parsed) || parsed <= 0)
      return setError("올바른 금액을 입력해주세요.");
    onSave({ type, category, amount: parsed, memo: memo.trim() || undefined });
  };

  const handleAmountChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, "");
    setAmount(digits ? Number(digits).toLocaleString("ko-KR") : "");
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">
            {initial ? "템플릿 수정" : "템플릿 추가"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              대분류
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(["income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    type === t
                      ? t === "income"
                        ? "bg-blue-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t === "income" ? "수입" : "지출"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              금액
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                원
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              메모 <span className="text-gray-300">(선택)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="간단한 메모를 남겨보세요"
              maxLength={50}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors ${
              type === "income"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {initial ? "수정하기" : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FrequentTransactions() {
  const { openModalWithPrefill } = useTransactionStore();
  const { templates, addTemplate, updateTemplate, removeTemplate } =
    useTemplates();
  const [isEditMode, setIsEditMode] = useState(false);
  // null = closed, "new" = adding, TransactionTemplate = editing
  const [formTarget, setFormTarget] = useState<
    TransactionTemplate | "new" | null
  >(null);

  const handleCardTap = (t: TransactionTemplate) => {
    if (isEditMode) {
      setFormTarget(t);
    } else {
      openModalWithPrefill({
        type: t.type,
        category: t.category,
        amount: t.amount,
        memo: t.memo,
      });
    }
  };

  const handleFormSave = (data: Omit<TransactionTemplate, "id">) => {
    if (formTarget === "new") {
      addTemplate(data);
    } else if (formTarget) {
      updateTemplate(formTarget.id, data);
    }
    setFormTarget(null);
  };

  const editButton = (
    <button
      onClick={() => setIsEditMode((v) => !v)}
      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
        isEditMode
          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {isEditMode ? "완료" : "편집"}
    </button>
  );

  return (
    <>
      <CollapsibleSection
        title="자주 쓰는 거래"
        subtitle={
          isEditMode ? "카드를 눌러 수정 · ✕로 삭제" : "탭하면 바로 등록"
        }
        defaultOpen={true}
        headerAction={editButton}
      >
        {templates.length === 0 ? (
          <div className="px-4 py-8 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-300 text-center leading-relaxed">
              자주 쓰는 거래를 등록하면
              <br />
              탭 한 번으로 빠르게 추가할 수 있어요
            </p>
            <button
              onClick={() => setFormTarget("new")}
              className="text-sm text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              + 첫 번째 항목 추가
            </button>
          </div>
        ) : (
          <div
            className="flex gap-2.5 px-4 py-3 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {templates.map((t) => (
              <div key={t.id} className="relative flex-shrink-0">
                {isEditMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTemplate(t.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 flex items-center justify-center bg-gray-400 text-white rounded-full text-[10px] hover:bg-red-500 transition-colors"
                  >
                    ✕
                  </button>
                )}
                <button
                  onClick={() => handleCardTap(t)}
                  className={`w-28 rounded-xl p-3 text-left border transition-all active:scale-95 ${
                    isEditMode ? "ring-2 ring-indigo-200 ring-offset-1" : ""
                  } ${
                    t.type === "income"
                      ? "border-blue-100 bg-blue-50 hover:bg-blue-100"
                      : "border-red-100 bg-red-50 hover:bg-red-100"
                  }`}
                >
                  <div className="mb-2">
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        t.type === "income"
                          ? "text-blue-600 bg-blue-100"
                          : "text-red-600 bg-red-100"
                      }`}
                    >
                      {t.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mb-1.5 leading-tight">
                    {t.memo || "-"}
                  </p>
                  <p
                    className={`text-xs font-bold leading-tight ${
                      t.type === "income" ? "text-blue-600" : "text-red-500"
                    }`}
                  >
                    {formatAmount(t.amount)}
                  </p>
                </button>
              </div>
            ))}

            <button
              onClick={() => setFormTarget("new")}
              className="flex-shrink-0 w-14 min-h-[80px] rounded-xl border-2 border-dashed border-gray-200 text-gray-300 flex items-center justify-center hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl leading-none">+</span>
            </button>
          </div>
        )}
      </CollapsibleSection>

      {formTarget !== null && (
        <TemplateFormModal
          initial={formTarget !== "new" ? formTarget : undefined}
          onSave={handleFormSave}
          onClose={() => setFormTarget(null)}
        />
      )}
    </>
  );
}
