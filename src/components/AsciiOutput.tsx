import type { ConversionResult } from "@/lib/types";

interface AsciiOutputProps {
  result: ConversionResult;
}

export function AsciiOutput({ result }: AsciiOutputProps) {
  return (
    <div className="output-frame p-4 overflow-auto h-full mx-auto w-fit max-w-full">
      <pre
        className="text-xs leading-tight whitespace-pre text-foreground"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {result.ascii}
      </pre>
    </div>
  );
}
