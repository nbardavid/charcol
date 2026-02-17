import { ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { AsciiOutput } from "@/components/AsciiOutput";
import { Controls } from "@/components/Controls";
import { DropZone } from "@/components/DropZone";
import { LinkInput } from "@/components/LinkInput";
import { PasteInput } from "@/components/PasteInput";
import { Button } from "@/components/ui/button";
import { ParseError, parseExcalidrawFile } from "@/lib/parser";
import { convert } from "@/lib/renderer";
import type { ConversionResult } from "@/lib/types";

type Tab = "file" | "link" | "paste";

export default function App() {
  const [width, setWidth] = useState("120");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("file");
  const [showSplash, setShowSplash] = useState(true);

  const isOutputMode = result !== null;

  const columnMaxWidth = !isOutputMode
    ? "max-w-3xl"
    : ({ "80": "max-w-3xl", "120": "max-w-5xl", "160": "max-w-7xl" }[width] ?? "max-w-5xl");

  const processContent = useCallback((content: string, targetWidth: number) => {
    const file = parseExcalidrawFile(content);
    return convert(file.elements, targetWidth);
  }, []);

  const handleFileLoaded = useCallback(
    (content: string, _name: string) => {
      setRawContent(content);
      setError(null);
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

  const handleReset = useCallback(() => {
    setResult(null);
    setRawContent(null);
    setError(null);
  }, []);

  const handleTabClick = useCallback(
    (tab: Tab) => {
      if (isOutputMode) {
        handleReset();
      }
      setActiveTab(tab);
    },
    [isOutputMode, handleReset],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "file", label: "File" },
    { id: "link", label: "Link" },
    { id: "paste", label: "Paste" },
  ];

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

      {/* Centered work column */}
      <div
        className={`${columnMaxWidth} w-full mx-auto flex-1 flex flex-col px-4 sm:px-6 pt-6 pb-6 min-h-0 transition-[max-width] duration-300 ease-in-out`}
      >
        {/* Header bar */}
        <div className="shrink-0 flex items-end justify-between">
          {/* Left: title + nav */}
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-light tracking-tight text-foreground">
              Charcol
            </h1>
            <nav className="flex gap-6 mt-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className="nav-link"
                  data-active={activeTab === tab.id}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: contextual controls (output mode only) */}
          {isOutputMode && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4" />
                New
              </Button>
              <Controls width={width} onWidthChange={handleWidthChange} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="shrink-0 border-t border-border/60 mt-4 mb-4" />

        {/* Work zone: input XOR output */}
        {!isOutputMode ? (
          <div key="input" className="flex-1 min-h-0 flex flex-col gap-4 animate-fade-in">
            {activeTab === "file" && (
              <DropZone onFileLoaded={handleFileLoaded} disabled={isLoading} />
            )}
            {activeTab === "link" && (
              <LinkInput
                onLinkLoaded={handleLinkLoaded}
                onError={handleLinkError}
                isLoading={isLoading}
                onLoadingChange={setIsLoading}
              />
            )}
            {activeTab === "paste" && <PasteInput onPasteLoaded={handleFileLoaded} />}

            {error && (
              <div className="shrink-0 rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
                <p className="text-sm" style={{ color: "var(--destructive)" }}>
                  {error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div key="output" className="flex-1 min-h-0 animate-fade-in">
            <AsciiOutput result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
