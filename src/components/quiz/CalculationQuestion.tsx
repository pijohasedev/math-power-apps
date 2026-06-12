"use client";

import { useRef, useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { MathKeyboard } from "@/components/math/MathKeyboard";

interface CalculationQuestionProps {
  questionText: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function CalculationQuestion({ questionText, onAnswer, disabled }: CalculationQuestionProps) {
  const [input, setInput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    if (disabled || !input.trim()) return;
    onAnswer(input.trim());
  }

  function handleInsert(text: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const newInput = input.slice(0, start) + text + input.slice(end);
    setInput(newInput);
    requestAnimationFrame(() => {
      el.setSelectionRange(start + text.length, start + text.length);
      el.focus();
    });
  }

  function handleDelete() {
    setInput(prev => prev.slice(0, -1));
  }

  function handleClear() {
    setInput("");
  }

  return (
    <div className="space-y-4">
      <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 rounded-2xl">
        <MathRenderer text={questionText} displayMode />
      </div>
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowKeyboard(true)}
          placeholder="Taip jawapan dan pengiraan..."
          disabled={disabled}
          rows={3}
          className="flex-1 p-4 text-base border-2 border-amber-200 rounded-2xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none resize-none disabled:opacity-50 bg-white"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="h-14 px-8 bg-gradient-to-r from-orange-400 to-rose-500 text-white font-heading text-base rounded-2xl hover:from-orange-500 hover:to-rose-600 disabled:opacity-50 transition-all active:scale-95 shadow-md"
        >
          Hantar
        </button>
      </div>
      {showKeyboard && !disabled && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <MathKeyboard onInsert={handleInsert} onDelete={handleDelete} onClear={handleClear} />
        </div>
      )}
    </div>
  );
}
