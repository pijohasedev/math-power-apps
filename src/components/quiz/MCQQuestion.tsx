"use client";

import { useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";

interface MCQQuestionProps {
  questionText: string;
  options: string[];
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

const OPTION_COLORS = [
  { border: "border-blue-300", bg: "bg-blue-50", hover: "hover:border-blue-400", selected: "border-blue-500 bg-blue-100", badge: "bg-blue-500" },
  { border: "border-emerald-300", bg: "bg-emerald-50", hover: "hover:border-emerald-400", selected: "border-emerald-500 bg-emerald-100", badge: "bg-emerald-500" },
  { border: "border-amber-300", bg: "bg-amber-50", hover: "hover:border-amber-400", selected: "border-amber-500 bg-amber-100", badge: "bg-amber-500" },
  { border: "border-rose-300", bg: "bg-rose-50", hover: "hover:border-rose-400", selected: "border-rose-500 bg-rose-100", badge: "bg-rose-500" },
];

export function MCQQuestion({ questionText, options, onAnswer, disabled }: MCQQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(opt: string) {
    if (disabled || selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt), 300);
  }

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-5">
      <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl">
        <MathRenderer text={questionText} displayMode />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const colors = OPTION_COLORS[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={!!disabled}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? `${colors.selected} shadow-md scale-[1.02]`
                  : `${colors.border} ${colors.bg} ${colors.hover} hover:shadow-sm`
              } disabled:opacity-60 disabled:cursor-default`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                isSelected ? colors.badge : "bg-gray-400"
              }`}>
                {labels[i]}
              </span>
              <span className="flex-1 font-medium"><MathRenderer text={opt} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
