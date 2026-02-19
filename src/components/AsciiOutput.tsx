import { useEffect, useRef, useState } from "react";
import type { ConversionResult } from "@/lib/types";

interface AsciiOutputProps {
  result: ConversionResult;
  columns: number;
}

export function AsciiOutput({ result, columns }: AsciiOutputProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [charWidth, setCharWidth] = useState(0);

  useEffect(() => {
    if (measureRef.current) {
      setCharWidth(measureRef.current.getBoundingClientRect().width);
    }
  }, []);

  // padding: p-4 = 16px each side = 32px + border 2*2 + outline offset ~8 ≈ 40px
  const frameWidth = charWidth > 0 ? charWidth * columns + 40 : undefined;

  return (
    <div
      className="output-frame p-4 overflow-auto h-full mx-auto max-w-full transition-[width] duration-300 ease-out"
      style={{ width: frameWidth }}
    >
      {/* Hidden span to measure one monospace character */}
      <span
        ref={measureRef}
        aria-hidden
        className="absolute opacity-0 pointer-events-none text-xs whitespace-pre"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        X
      </span>
      <pre
        className="text-xs leading-tight whitespace-pre text-foreground"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {result.ascii}
      </pre>
    </div>
  );
}
