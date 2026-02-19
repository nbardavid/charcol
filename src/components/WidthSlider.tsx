interface WidthSliderProps {
  width: number;
  onWidthChange: (value: number) => void;
}

export function WidthSlider({ width, onWidthChange }: WidthSliderProps) {
  return (
    <div className="flex items-center gap-4 w-full max-w-md mx-auto">
      <span className="font-[family-name:var(--font-display)] text-sm tracking-wide text-muted-foreground shrink-0">
        Width
      </span>
      <input
        type="range"
        min={60}
        max={200}
        step={10}
        value={width}
        onChange={(e) => onWidthChange(Number(e.target.value))}
        className="width-slider flex-1"
        list="width-notches"
      />
      <datalist id="width-notches">
        <option value="60" />
        <option value="80" />
        <option value="100" />
        <option value="120" />
        <option value="140" />
        <option value="160" />
        <option value="180" />
        <option value="200" />
      </datalist>
      <span className="font-[family-name:var(--font-mono)] text-sm text-foreground tabular-nums w-8 text-right shrink-0">
        {width}
      </span>
    </div>
  );
}
