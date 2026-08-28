/**
 * Shared control chrome. Inputs, selects and the tag box all render the same
 * border, focus ring and dark-mode surface so a form reads as one system.
 *
 * Kept apart from `field.tsx` so that file only exports components, which is
 * what Vite's fast refresh needs.
 */
export const fieldClassName = (error?: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all duration-150 ease-smooth placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
    error
      ? 'border-red-400 focus:border-red-500 dark:border-red-500/60'
      : 'border-gray-300 focus:border-brand-500 dark:border-gray-600 dark:focus:border-brand-400'
  }`;

/**
 * Same treatment for wrappers that host their own controls (amount + currency,
 * the tag token box), driven by `focus-within` instead of `focus`.
 */
export const fieldShellClassName = (error?: boolean) =>
  `w-full rounded-lg border bg-white transition-all duration-150 ease-smooth focus-within:ring-2 focus-within:ring-brand-500/30 dark:bg-gray-800 ${
    error
      ? 'border-red-400 focus-within:border-red-500 dark:border-red-500/60'
      : 'border-gray-300 focus-within:border-brand-500 dark:border-gray-600 dark:focus-within:border-brand-400'
  }`;
