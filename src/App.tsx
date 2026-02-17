import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { AsciiOutput } from "@/components/AsciiOutput";
import { Controls } from "@/components/Controls";
import { DropZone } from "@/components/DropZone";
import { LinkInput } from "@/components/LinkInput";
import { ParseError, parseExcalidrawFile } from "@/lib/parser";
import { convert } from "@/lib/renderer";
import type { ConversionResult } from "@/lib/types";

export default function App() {
  const [width, setWidth] = useState("120");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processContent = useCallback((content: string, targetWidth: number) => {
    const file = parseExcalidrawFile(content);
    return convert(file.elements, targetWidth);
  }, []);

  const handleFileLoaded = useCallback(
    (content: string, name: string) => {
      setRawContent(content);
      setError(null);
      setFileName(name);
      try {
        const conversionResult = processContent(content, parseInt(width, 10));
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

  const handleLinkLoaded = useCallback(
    (content: string, sourceName: string) => {
      handleFileLoaded(content, sourceName);
    },
    [handleFileLoaded],
  );

  const handleLinkError = useCallback((message: string) => {
    if (message) {
      setError(message);
      setResult(null);
    }
  }, []);

  const handleWidthChange = useCallback(
    (newWidth: string) => {
      setWidth(newWidth);
      if (rawContent) {
        try {
          const conversionResult = processContent(rawContent, parseInt(newWidth, 10));
          setResult(conversionResult);
        } catch {
          // Error already handled on initial load
        }
      }
    },
    [rawContent, processContent],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="vignette relative min-h-[80vh] sm:min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="animate-fade-in-up stagger-1 font-[family-name:var(--font-display)] text-7xl sm:text-8xl lg:text-9xl font-light tracking-tight text-foreground">
          Charcol
        </h1>
        <p className="animate-fade-in-up stagger-2 font-[family-name:var(--font-display)] text-xl sm:text-2xl italic text-muted-foreground mt-4">
          Characters that draw.
        </p>
        <p className="animate-fade-in-up stagger-3 text-xs sm:text-sm uppercase tracking-[0.25em] text-muted-foreground mt-3">
          Excalidraw to ASCII art
        </p>
        <a
          href="#tool"
          className="animate-fade-in stagger-4 mt-12 text-muted-foreground/60 hover:text-primary transition-colors"
          aria-label="Scroll to tool"
        >
          <ChevronDown className="h-8 w-8 animate-gentle-bounce" />
        </a>
      </section>

      {/* Tool Section */}
      <section id="tool" className="mx-auto max-w-5xl px-4 pt-12 pb-20">
        <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-light text-center mb-10">
          The Studio
        </h2>

        <div className="space-y-6">
          <DropZone onFileLoaded={handleFileLoaded} disabled={isLoading} />

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border/60" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-display)]">
              or
            </span>
            <div className="flex-1 border-t border-border/60" />
          </div>

          <LinkInput
            onLinkLoaded={handleLinkLoaded}
            onError={handleLinkError}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Controls width={width} onWidthChange={handleWidthChange} />
            {fileName && !error && (
              <p className="text-sm text-muted-foreground">
                Loaded: <span className="font-semibold">{fileName}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
              <p className="text-sm" style={{ color: "var(--destructive)" }}>
                {error}
              </p>
            </div>
          )}

          {result && <AsciiOutput result={result} />}
        </div>

        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="font-[family-name:var(--font-display)] text-sm text-muted-foreground italic">
            CHAR + coal — characters that draw, like charcoal sketches.
          </p>
        </footer>
      </section>
    </div>
  );
}
