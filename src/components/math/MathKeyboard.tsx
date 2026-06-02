"use client";

interface MathKeyboardProps {
  onInsert: (text: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const buttons: { label: string; insert: string }[][] = [
  [{ label: "7", insert: "7" }, { label: "8", insert: "8" }, { label: "9", insert: "9" }, { label: "÷", insert: "\\div " }, { label: "(", insert: "(" }, { label: ")", insert: ")" }],
  [{ label: "4", insert: "4" }, { label: "5", insert: "5" }, { label: "6", insert: "6" }, { label: "×", insert: "\\times " }, { label: "√", insert: "\\sqrt{}" }, { label: "π", insert: "\\pi " }],
  [{ label: "1", insert: "1" }, { label: "2", insert: "2" }, { label: "3", insert: "3" }, { label: "+", insert: "+" }, { label: "²", insert: "^{2}" }, { label: "³", insert: "^{3}" }],
  [{ label: "0", insert: "0" }, { label: ".", insert: "." }, { label: "-", insert: "-" }, { label: "=", insert: "=" }, { label: "ⁿ", insert: "^{n}" }, { label: "½", insert: "\\frac{}{}" }],
];

export function MathKeyboard({ onInsert, onDelete, onClear }: MathKeyboardProps) {
  return (
    <div className="border rounded-lg p-2 bg-muted/50 max-w-sm mx-auto">
      {buttons.map((row, ri) => (
        <div key={ri} className="flex gap-1 mb-1 last:mb-0">
          {row.map(({ label, insert }) => (
            <button
              key={label}
              type="button"
              onClick={() => onInsert(insert)}
              className="flex-1 h-9 text-sm font-medium bg-background border rounded-md hover:bg-accent active:bg-accent/80 transition-colors"
            >
              {label}
            </button>
          ))}
          {ri === 3 && (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="flex-1 h-9 text-sm font-medium bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 active:bg-yellow-300 transition-colors"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={onClear}
                className="flex-1 h-9 text-sm font-medium bg-red-100 border border-red-300 rounded-md hover:bg-red-200 active:bg-red-300 transition-colors"
              >
                ✕
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}