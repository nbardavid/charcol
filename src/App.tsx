import { ArrowLeft, Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { AsciiOutput } from "@/components/AsciiOutput";
import { UnifiedInput } from "@/components/UnifiedInput";
import { Button } from "@/components/ui/button";
import { WidthSlider } from "@/components/WidthSlider";
import { useSound } from "@/hooks/use-sound";
import { bookFlip2Sound } from "@/lib/book-flip-2";
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

  const [playFlip] = useSound(bookFlip2Sound, { volume: 0.5 });
  const [playFlipBack] = useSound(bookFlip2Sound, { volume: 0.5, reverse: true });

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
        playFlip();
      } catch (err) {
        if (err instanceof ParseError) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while processing the file.");
        }
        setResult(null);
      }
    },
    [width, processContent, playFlip],
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
    playFlipBack();
    setResult(null);
    setRawContent(null);
    setError(null);
    setInputKey((k) => k + 1);
  }, [playFlipBack]);

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

      {/* Header — CSS Grid: [NewBtn] [Title+subtitle] [CopyBtn] */}
      <header
        className={`shrink-0 grid grid-cols-[auto_1fr_auto] items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOutputMode ? "py-3 px-4 sm:px-6" : "pt-[30vh] pb-8 px-6"
        }`}
      >
        {/* Left: New button */}
        <div
          className={`transition-all duration-300 ${
            isOutputMode ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4" />
            New
          </Button>
        </div>

        {/* Center: Title + subtitle */}
        <div className="text-center">
          <h1
            className={`font-[family-name:var(--font-display)] font-light tracking-tight text-foreground transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOutputMode ? "text-xl" : "text-6xl sm:text-7xl lg:text-8xl"
            }`}
          >
            Charcol
          </h1>
          <div
            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOutputMode ? "max-h-0 opacity-0" : "max-h-16 opacity-100 mt-4"
            }`}
          >
            <p className="font-[family-name:var(--font-display)] text-xl sm:text-2xl italic text-muted-foreground">
              Characters that draw.
            </p>
          </div>
        </div>

        {/* Right: Copy button */}
        <div
          className={`transition-all duration-300 ${
            isOutputMode ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
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
      </header>

      {/* Card — same div always */}
      <div
        className={`relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOutputMode
            ? "flex-1 min-h-0 mx-4 sm:mx-6 p-2 overflow-auto"
            : "max-w-xl w-full mx-auto paper-surface deckled-edge"
        }`}
      >
        {/* Input content */}
        <div
          className={`transition-opacity duration-300 ${
            isOutputMode
              ? "opacity-0 absolute inset-0 pointer-events-none overflow-hidden"
              : "opacity-100 relative"
          }`}
        >
          <UnifiedInput
            key={inputKey}
            onContent={handleFileLoaded}
            onError={handleError}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
          />
        </div>

        {/* Output content */}
        <div
          className={`transition-opacity duration-300 ${
            isOutputMode
              ? "opacity-100 relative h-full"
              : "opacity-0 absolute inset-0 pointer-events-none overflow-hidden"
          }`}
        >
          {result && <AsciiOutput result={result} columns={width} />}
        </div>
      </div>

      {/* Error — below card in input mode */}
      {error && !isOutputMode && (
        <div className="max-w-xl mx-auto mt-4 rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
          <p className="text-sm" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Footer — always in DOM, transitions visibility */}
      <div
        className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          isOutputMode ? "max-h-20 opacity-100 py-3 px-4 sm:px-6" : "max-h-0 opacity-0"
        }`}
      >
        <WidthSlider width={width} onWidthChange={handleWidthChange} />
      </div>
    </div>
  );
}
