"use client";

import { useMemo } from "react";
import katex from "katex";

interface MathPreviewProps {
  value: string;
  label?: string;
}

function renderMath(text: string): string {
  if (!text) return "";

  let result = "";
  let i = 0;

  while (i < text.length) {
    const dollarIdx = text.indexOf("$", i);
    if (dollarIdx === -1) {
      result += escapeHtml(text.slice(i));
      break;
    }

    if (dollarIdx > i) {
      result += escapeHtml(text.slice(i, dollarIdx));
    }

    const isDisplay = dollarIdx + 1 < text.length && text[dollarIdx + 1] === "$";
    const closeIdx = isDisplay
      ? text.indexOf("$$", dollarIdx + 2)
      : text.indexOf("$", dollarIdx + 1);

    if (closeIdx === -1) {
      result += escapeHtml(text.slice(dollarIdx));
      break;
    }

    const math = text.slice(dollarIdx + (isDisplay ? 2 : 1), closeIdx);
    try {
      result += katex.renderToString(math, {
        displayMode: isDisplay,
        throwOnError: false,
      });
    } catch {
      result += escapeHtml(text.slice(dollarIdx, closeIdx + (isDisplay ? 2 : 1)));
    }

    i = closeIdx + (isDisplay ? 2 : 1);
  }

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function MathPreview({ value, label }: MathPreviewProps) {
  const { html, hasError } = useMemo(() => {
    if (!value) return { html: "", hasError: false };
    try {
      return { html: renderMath(value), hasError: false };
    } catch {
      return { html: escapeHtml(value), hasError: true };
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
      {hasError && (
        <p className="text-xs text-amber-600 mb-1">Pratonton: dipaparkan sebagai teks</p>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
