import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ConversionResult } from "@/lib/types";

interface AsciiOutputProps {
  result: ConversionResult;
}

export function AsciiOutput({ result }: AsciiOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="paper-surface p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-sm text-muted-foreground">
          {result.width}&times;{result.height}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className={`gap-2 ${copied ? "text-primary border-primary/50" : ""}`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="output-frame p-4 overflow-auto flex-1 min-h-0">
        <pre
          className="text-xs leading-tight whitespace-pre text-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {result.ascii}
        </pre>
      </div>
    </div>
  );
}
