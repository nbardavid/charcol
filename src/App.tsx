import { ArrowLeft, Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { AsciiOutput } from "@/components/AsciiOutput";
import { UnifiedInput } from "@/components/UnifiedInput";
import { Button } from "@/components/ui/button";
import { WidthSlider } from "@/components/WidthSlider";
import { ParseError, parseExcalidrawFile } from "@/lib/parser";
import { convert } from "@/lib/renderer";
import type { ConversionResult } from "@/lib/types";

export default function App() {
  const [width, setWidth] = useState(120);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [inputKey, setInputKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const isOutputMode = result !== null;

  const processContent = useCallback((content: string, targetWidth: number) => {
    const file = parseExcalidrawFile(content);
    return convert(file.elements, targetWidth);
  }, []);

  const handleFileLoaded = useCallback(
    (content: string, _name: string) => {
      setRawContent(content);
      setError(null);
      try {
        const conversionResult = processContent(content, width);
        setResult(conversionResult);
      } catch (err) {
        if (err instanceof ParseError) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while processing the file.");
        }
        setResult(null);
      }
    },
    [width, processContent],
  );

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setWidth(newWidth);
      if (rawContent) {
        try {
          const conversionResult = processContent(rawContent, newWidth);
          setResult(conversionResult);
        } catch {
          // Error already handled on initial load
        }
      }
    },
    [rawContent, processContent],
  );

  const handleReset = useCallback(() => {
    setResult(null);
    setRawContent(null);
    setError(null);
    setInputKey((k) => k + 1);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setResult(null);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Splash — book-opening split */}
      {showSplash && (
        <>
          <div className="splash-half splash-top" onAnimationEnd={() => setShowSplash(false)}>
            <div className="splash-inner">
              <h1 className="font-[family-name:var(--font-display)] text-7xl sm:text-8xl lg:text-9xl font-light tracking-tight text-foreground">
                Charcol
              </h1>
              <p className="font-[family-name:var(--font-display)] text-xl sm:text-2xl italic text-muted-foreground mt-4">
                Characters that draw.
              </p>
            </div>
          </div>
          <div className="splash-half splash-bottom">
            <div className="splash-inner">
              <h1 className="font-[family-name:var(--font-display)] text-7xl sm:text-8xl lg:text-9xl font-light tracking-tight text-foreground">
                Charcol
              </h1>
              <p className="font-[family-name:var(--font-display)] text-xl sm:text-2xl italic text-muted-foreground mt-4">
                Characters that draw.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Phase 1: Input — centered on viewport */}
      <div className={`input-phase ${!isOutputMode ? "input-phase--active" : "input-phase--exit"}`}>
        <div className="text-center mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight text-foreground">
            Charcol
          </h1>
          <p className="font-[family-name:var(--font-display)] text-xl sm:text-2xl italic text-muted-foreground mt-4">
            Characters that draw.
          </p>
        </div>

        <UnifiedInput
          key={inputKey}
          onContent={handleFileLoaded}
          onError={handleError}
          isLoading={isLoading}
          onLoadingChange={setIsLoading}
        />

        {error && !isOutputMode && (
          <div className="max-w-xl mx-auto mt-4 rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Phase 2: Output — near fullscreen */}
      <div
        className={`output-phase ${isOutputMode ? "output-phase--active" : "output-phase--hidden"}`}
      >
        {/* Compact header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4" />
            New
          </Button>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-light tracking-tight text-foreground">
            Charcol
          </h1>
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

        {/* ASCII output area */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-auto">
          {result && <AsciiOutput result={result} />}
        </div>

        {/* Bottom bar: width slider */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-border/60">
          <WidthSlider width={width} onWidthChange={handleWidthChange} />
        </div>
      </div>
    </div>
  );
}
