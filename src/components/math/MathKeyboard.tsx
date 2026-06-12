"use client";

interface MathKeyboardProps {
  onInsert: (text: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

interface KeyDef {
  label: string;
  insert: string;
  color: string;
}

const rows: KeyDef[][] = [
  [
    { label: "7", insert: "7", color: "bg-white hover:bg-gray-100" },
    { label: "8", insert: "8", color: "bg-white hover:bg-gray-100" },
    { label: "9", insert: "9", color: "bg-white hover:bg-gray-100" },
    { label: "÷", insert: "\\div ", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { label: "(", insert: "(", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
    { label: ")", insert: ")", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
  ],
  [
    { label: "4", insert: "4", color: "bg-white hover:bg-gray-100" },
    { label: "5", insert: "5", color: "bg-white hover:bg-gray-100" },
    { label: "6", insert: "6", color: "bg-white hover:bg-gray-100" },
    { label: "×", insert: "\\times ", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { label: "√", insert: "\\sqrt{}", color: "bg-green-50 hover:bg-green-100 text-green-700" },
    { label: "π", insert: "\\pi ", color: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
  ],
  [
    { label: "1", insert: "1", color: "bg-white hover:bg-gray-100" },
    { label: "2", insert: "2", color: "bg-white hover:bg-gray-100" },
    { label: "3", insert: "3", color: "bg-white hover:bg-gray-100" },
    { label: "+", insert: "+", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { label: "²", insert: "^{2}", color: "bg-violet-50 hover:bg-violet-100 text-violet-700" },
    { label: "³", insert: "^{3}", color: "bg-violet-50 hover:bg-violet-100 text-violet-700" },
  ],
  [
    { label: "0", insert: "0", color: "bg-white hover:bg-gray-100" },
    { label: ".", insert: ".", color: "bg-white hover:bg-gray-100" },
    { label: "-", insert: "-", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { label: "=", insert: "=", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { label: "ⁿ", insert: "^{n}", color: "bg-violet-50 hover:bg-violet-100 text-violet-700" },
    { label: "½", insert: "\\frac{}{}", color: "bg-green-50 hover:bg-green-100 text-green-700" },
  ],
];

export function MathKeyboard({ onInsert, onDelete, onClear }: MathKeyboardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-2xl p-3 bg-gray-50/80 max-w-md mx-auto shadow-inner">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5 mb-1.5 last:mb-0">
          {row.map(({ label, insert, color }) => (
            <button
              key={label}
              type="button"
              onClick={() => onInsert(insert)}
              className={`flex-1 h-10 text-sm font-semibold border border-gray-200 rounded-xl ${color} active:scale-95 transition-all shadow-sm`}
            >
              {label}
            </button>
          ))}
          {ri === 3 && (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="flex-1 h-10 text-sm font-semibold bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-xl hover:bg-yellow-100 active:scale-95 transition-all shadow-sm"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={onClear}
                className="flex-1 h-10 text-sm font-semibold bg-red-50 border border-red-300 text-red-700 rounded-xl hover:bg-red-100 active:scale-95 transition-all shadow-sm"
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
