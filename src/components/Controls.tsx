interface ControlsProps {
  width: string;
  onWidthChange: (value: string) => void;
}

const widths = [
  { value: "80", label: "80" },
  { value: "120", label: "120" },
  { value: "160", label: "160" },
];

export function Controls({ width, onWidthChange }: ControlsProps) {
  return (
    <div className="flex items-center gap-6">
      <span className="font-[family-name:var(--font-display)] text-sm tracking-wide text-muted-foreground mr-2">
        Width
      </span>
      {widths.map((w) => (
        <button
          key={w.value}
          type="button"
          className="nav-link"
          data-active={width === w.value}
          onClick={() => onWidthChange(w.value)}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}
