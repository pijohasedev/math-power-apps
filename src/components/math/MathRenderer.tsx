"use client";

import katex from "katex";
import { useEffect, useRef } from "react";

interface MathRendererProps {
  text: string;
  displayMode?: boolean;
  className?: string;
}

export function MathRenderer({ text, displayMode = false, className = "" }: MathRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(text, containerRef.current, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      containerRef.current.textContent = text;
    }
  }, [text, displayMode]);

  if (!text) return <span className={className} />;

  return <span ref={containerRef} className={className} />;
}