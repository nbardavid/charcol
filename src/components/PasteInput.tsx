import { ClipboardPaste } from "lucide-react";
import { type FormEvent, useCallback, useRef } from "react";

interface PasteInputProps {
  onPasteLoaded: (content: string, name: string) => void;
}

export function PasteInput({ onPasteLoaded }: PasteInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const content = textareaRef.current?.value.trim();
      if (!content) return;
      onPasteLoaded(content, "Pasted JSON");
    },
    [onPasteLoaded],
  );

  return (
    <form onSubmit={handleSubmit} className="paper-surface deckled-edge px-6 py-6 sm:py-8 sm:px-8">
      <div className="flex items-start gap-3 max-w-lg mx-auto">
        <ClipboardPaste className="mt-2 h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <textarea
          ref={textareaRef}
          placeholder="Paste Excalidraw JSON..."
          rows={3}
          className="flex-1 resize-y bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-[family-name:var(--font-mono)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 font-[family-name:var(--font-display)]"
        >
          Convert
        </button>
      </div>
    </form>
  );
}
