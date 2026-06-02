"use client";

import { useMemo } from "react";
import katex from "katex";

interface MathPreviewProps {
  value: string;
  label?: string;
}

export function MathPreview({ value, label }: MathPreviewProps) {
  const { html, error } = useMemo(() => {
    if (!value) return { html: "", error: false };
    try {
      return {
        html: katex.renderToString(value, { displayMode: true, throwOnError: false }),
        error: false,
      };
    } catch {
      return { html: "", error: true };
    }
  }, [value]);

  if (!value) {
    return (
      <div className="p-4 border rounded-md bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          {label || "Pratonton akan muncul di sini"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-muted/50 min-h-[3rem] overflow-x-auto">
      {error && (
        <p className="text-xs text-amber-600 mb-1">Pratonton: dipaparkan sebagai teks</p>
      )}
      <div className="text-center" dangerouslySetInnerHTML={{ __html: html || value }} />
    </div>
  );
}