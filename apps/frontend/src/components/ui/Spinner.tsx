interface Props {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = '' }: Props) {
  return (
    <div
      data-testid="spinner"
      style={{ width: size, height: size }}
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-brand-600 dark:border-gray-700 dark:border-t-brand-400 ${className}`}
    />
  );
}
