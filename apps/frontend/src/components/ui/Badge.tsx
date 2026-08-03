interface Props {
  label: string;
  color?: string;
  onRemove?: () => void;
  size?: 'xs' | 'sm';
}

export function Badge({ label, color, onRemove, size = 'sm' }: Props) {
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass}`}
      style={
        color
          ? { backgroundColor: `${color}18`, color, boxShadow: `inset 0 0 0 1px ${color}40` }
          : { backgroundColor: 'rgb(243 244 246)', color: 'rgb(75 85 99)' }
      }
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="-mr-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors hover:bg-black/10"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
