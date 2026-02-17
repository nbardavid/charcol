import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ControlsProps {
  width: string;
  onWidthChange: (value: string) => void;
}

export function Controls({ width, onWidthChange }: ControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="font-[family-name:var(--font-display)] text-sm tracking-wide whitespace-nowrap">
        Output width
      </label>
      <Select value={width} onValueChange={onWidthChange}>
        <SelectTrigger className="w-[140px] bg-card font-[family-name:var(--font-display)] tracking-wide border-border/80 shadow-sm hover:border-primary/40 focus:ring-primary/30 transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card font-[family-name:var(--font-display)] tracking-wide border-border/80">
          <SelectItem value="80">80 chars</SelectItem>
          <SelectItem value="120">120 chars</SelectItem>
          <SelectItem value="160">160 chars</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
