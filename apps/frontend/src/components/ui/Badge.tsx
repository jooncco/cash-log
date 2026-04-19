interface Props {
  label: string;
  color?: string;
  onRemove?: () => void;
}

export function Badge({ label, color, onRemove }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70" aria-label={`Remove ${label}`}>
          ×
        </button>
      )}
    </span>
  );
}
