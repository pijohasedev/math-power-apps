"use client";

import { useRef, useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { MathKeyboard } from "@/components/math/MathKeyboard";

interface FillBlankQuestionProps {
  questionText: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function FillBlankQuestion({ questionText, onAnswer, disabled }: FillBlankQuestionProps) {
  const [input, setInput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (disabled || !input.trim()) return;
    onAnswer(input.trim());
  }

  function handleInsert(text: string) {
    const el = inputRef.current;
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
      <div className="p-4 bg-muted/30 rounded-lg">
        <MathRenderer text={questionText} displayMode />
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowKeyboard(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Taip jawapan anda..."
          disabled={disabled}
          className="flex-1 h-12 px-4 text-lg border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-ring outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
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