import { Link, Loader2 } from "lucide-react";
import { type FormEvent, useCallback, useRef } from "react";

interface LinkInputProps {
  onLinkLoaded: (content: string, sourceName: string) => void;
  onError: (message: string) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

export function LinkInput({ onLinkLoaded, onError, isLoading, onLoadingChange }: LinkInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const url = inputRef.current?.value.trim();
      if (!url) return;

      onLoadingChange(true);
      onError("");

      try {
        const { fetchExcalidrawShareLink } = await import("@/lib/excalidraw-link");
        const json = await fetchExcalidrawShareLink(url);
        onLinkLoaded(json, "Shared diagram");
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
    [onLinkLoaded, onError, onLoadingChange],
  );

  return (
    <form onSubmit={handleSubmit} className="paper-surface deckled-edge px-6 py-6 sm:py-8 sm:px-8">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <Link className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="url"
          placeholder="Paste an Excalidraw share link..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-[family-name:var(--font-body)]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 font-[family-name:var(--font-display)]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
        </button>
      </div>
    </form>
  );
}
