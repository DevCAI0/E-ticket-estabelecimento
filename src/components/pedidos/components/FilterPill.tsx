interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

export function FilterPill({ active, onClick, label, count }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:border-orange-400 dark:text-orange-400"
          : "border-transparent bg-transparent text-muted-foreground hover:border-orange-500/30 hover:text-orange-500"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-1 rounded px-1.5 py-0.5 text-xs ${
            active
              ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
              : "bg-muted/50 text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
