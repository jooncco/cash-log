interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error 
            ? 'border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
        } bg-white dark:bg-gray-700 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
