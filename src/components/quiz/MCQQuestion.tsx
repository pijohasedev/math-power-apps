"use client";

import { useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";

interface MCQQuestionProps {
  questionText: string;
  options: string[];
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function MCQQuestion({ questionText, options, onAnswer, disabled }: MCQQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(opt: string) {
    if (disabled || selected) return;
    setSelected(opt);
    onAnswer(opt);
  }

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg">
        <MathRenderer text={questionText} displayMode />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={!!disabled}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/50 hover:bg-muted/50"
              } disabled:opacity-60 disabled:cursor-default`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {labels[i]}
              </span>
              <span className="flex-1"><MathRenderer text={opt} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}