import { type ChangeEvent, type DragEvent, useCallback, useEffect, useRef, useState } from "react";

interface UnifiedInputProps {
  onContent: (content: string, name: string) => void;
  onError: (msg: string) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

export function UnifiedInput({
  onContent,
  onError,
  isLoading,
  onLoadingChange,
}: UnifiedInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".excalidraw") && !file.name.endsWith(".json")) {
        onError("Please upload an .excalidraw or .json file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onContent(content, file.name);
      };
      reader.onerror = () => onError("Failed to read file");
      reader.readAsText(file);
    },
    [onContent, onError],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const fetchLink = useCallback(
    async (url: string) => {
      onLoadingChange(true);
      try {
        const { fetchExcalidrawShareLink } = await import("@/lib/excalidraw-link");
        const json = await fetchExcalidrawShareLink(url);
        onContent(json, "Shared diagram");
      } catch (err) {
        const { ShareLinkError } = await import("@/lib/excalidraw-link");
        if (err instanceof ShareLinkError) {
          onError(err.message);
        } else {
          onError("Failed to import the shared diagram.");
        }
      } finally {
        onLoadingChange(false);
      }
    },
    [onContent, onError, onLoadingChange],
  );

  const handleChange = useCallback(() => {
    const value = textareaRef.current?.value.trim() ?? "";
    if (!value) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.startsWith("https://")) {
      debounceRef.current = setTimeout(() => fetchLink(value), 500);
      return;
    }

    if (value.startsWith("{")) {
      try {
        JSON.parse(value);
        onContent(value, "Pasted JSON");
      } catch {
        // Not valid JSON yet — wait for more input
      }
    }
  }, [fetchLink, onContent]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div
      className={`paper-surface deckled-edge transition-all duration-200 max-w-xl w-full mx-auto ${
        isLoading
          ? "pointer-events-none opacity-60"
          : isDragging
            ? "border-primary scale-[1.01] shadow-[inset_0_0_20px_rgba(184,115,51,0.15)]"
            : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <textarea
          ref={textareaRef}
          rows={3}
          placeholder="Drop a file, paste a link or paste JSON…"
          onChange={handleChange}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-[family-name:var(--font-body)] text-center"
        />
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-copper transition-colors font-[family-name:var(--font-display)] cursor-pointer"
          >
            or click to browse
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".excalidraw,.json"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center mt-3 animate-pulse">
            Fetching diagram…
          </p>
        )}
      </div>
    </div>
  );
}
