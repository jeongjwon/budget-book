"use client";

import { useState, ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
}

export default function CollapsibleSection({
  title,
  children,
  subtitle,
  defaultOpen = false,
  headerAction,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden transition-all">
      <div
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-gray-700">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>
          )}
          <span
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] border-t border-gray-50 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {children}
      </div>
    </div>
  );
}
