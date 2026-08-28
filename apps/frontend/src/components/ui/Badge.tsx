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
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${
        // The uncolored variant has to come from Tailwind, not an inline style,
        // or it stays light-gray-on-dark in dark mode.
        color ? '' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'
      }`}
      style={
        color
          ? { backgroundColor: `${color}18`, color, boxShadow: `inset 0 0 0 1px ${color}40` }
          : undefined
      }
    >
      {label}
      {onRemove && (
        <button
          // Without this the badge sits inside a form and submits it on click.
          type="button"
          onClick={onRemove}
          className="-mr-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/20"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
