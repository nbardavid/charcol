import { Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useCallback, useState } from "react";

interface DropZoneProps {
  onFileLoaded: (content: string, fileName: string) => void;
  disabled?: boolean;
}

export function DropZone({ onFileLoaded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.name.endsWith(".excalidraw") && !file.name.endsWith(".json")) {
        setError("Please upload an .excalidraw or .json file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content, file.name);
      };
      reader.onerror = () => setError("Failed to read file");
      reader.readAsText(file);
    },
    [onFileLoaded],
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

  return (
    <div
      className={`paper-surface deckled-edge cursor-pointer transition-all duration-200 ${
        disabled
          ? "pointer-events-none opacity-60"
          : isDragging
            ? "border-primary scale-[1.01] shadow-[inset_0_0_20px_rgba(184,115,51,0.15)]"
            : "hover:scale-[1.005]"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label className="flex flex-col items-center justify-center gap-3 py-16 cursor-pointer">
        <Upload
          className={`h-10 w-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
          strokeWidth={1.5}
        />
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-lg font-light">
            Drop your .excalidraw file here
          </p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        </div>
        <input
          type="file"
          accept=".excalidraw,.json"
          onChange={handleFileInput}
          className="hidden"
        />
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </label>
    </div>
  );
}
