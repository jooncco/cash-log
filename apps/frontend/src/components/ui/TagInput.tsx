import { KeyboardEvent, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FieldLabel } from './field';
import { fieldShellClassName } from './fieldStyles';
import type { Tag } from '../../types';

interface Props {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Existing tags, used both for suggestions and to colour selected chips. */
  options: Tag[];
  placeholder: string;
  /** Called with the typed text to label the "create this tag" row. */
  createLabel: (query: string) => string;
  selectedLabel: string;
  emptyLabel: string;
  testId?: string;
}

const norm = (value: string) => value.trim().toLowerCase();

const MAX_SUGGESTIONS = 8;

const MAX_DROPDOWN_HEIGHT = 224;
const DROPDOWN_GAP = 8;

/** Nearest ancestor that clips overflow — the modal body, in practice. */
function clippingBounds(node: HTMLElement) {
  let current = node.parentElement;
  while (current) {
    const overflowY = getComputedStyle(current).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') {
      const rect = current.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }
    current = current.parentElement;
  }
  return { top: 0, bottom: window.innerHeight };
}

/**
 * Tag combobox. Selected tags live *inside* the control as chips and
 * suggestions drop below it as list rows, so "already added" and "matched by
 * search" never wear the same shape. The dropdown is absolutely positioned so
 * typing never pushes the rest of the form up and down.
 */
export function TagInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  createLabel,
  selectedLabel,
  emptyLabel,
  testId,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [placement, setPlacement] = useState<{ up: boolean; maxHeight: number }>({
    up: false,
    maxHeight: MAX_DROPDOWN_HEIGHT,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const colorByName = useMemo(
    () => new Map(options.map((tag) => [norm(tag.name), tag.color])),
    [options],
  );

  // Suggestions are matched case-insensitively and never repeat a chip that is
  // already on the transaction. An empty query lists everything still on offer.
  const matches = useMemo(() => {
    const picked = new Set(value.map(norm));
    const q = norm(query);
    return options
      .filter((tag) => !picked.has(norm(tag.name)) && (!q || norm(tag.name).includes(q)))
      .slice(0, MAX_SUGGESTIONS);
  }, [options, value, query]);

  const trimmed = query.trim();
  const canCreate =
    trimmed.length > 0 &&
    !value.some((name) => norm(name) === norm(trimmed)) &&
    !options.some((tag) => norm(tag.name) === norm(trimmed));
  const rowCount = matches.length + (canCreate ? 1 : 0);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // The dropdown sits inside the modal's scroll container, which would clip it
  // near the bottom of the form. Keep it below whenever the list actually fits
  // there — a two-row list should not flip up and cover the field's own label —
  // and otherwise put it wherever there is more room, sized to that room.
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const shell = shellRef.current;
      const list = listRef.current;
      if (!shell || !list) return;
      const rect = shell.getBoundingClientRect();
      const bounds = clippingBounds(shell);
      const below = bounds.bottom - rect.bottom - DROPDOWN_GAP;
      const above = rect.top - bounds.top - DROPDOWN_GAP;
      // scrollHeight is the natural content height, independent of the cap
      // currently applied, so this does not feed back into itself.
      const wanted = Math.min(MAX_DROPDOWN_HEIGHT, list.scrollHeight);
      if (below >= wanted) setPlacement({ up: false, maxHeight: wanted });
      else if (above >= wanted) setPlacement({ up: true, maxHeight: wanted });
      else setPlacement({ up: above > below, maxHeight: Math.max(above, below) });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, rowCount, value.length]);

  // Close on an outside press so the dropdown never hangs over the rest of the form.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const add = (name: string) => {
    const next = name.trim();
    if (!next) return;
    if (!value.some((existing) => norm(existing) === norm(next))) onChange([...value, next]);
    setQuery('');
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  const remove = (name: string) => onChange(value.filter((existing) => existing !== name));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Mid-composition Enter only commits the Hangul syllable, never the tag.
    if (isComposing) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (rowCount === 0) return;
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) =>
        e.key === 'ArrowDown' ? (i + 1) % rowCount : (i - 1 + rowCount) % rowCount,
      );
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (open && activeIndex < matches.length) add(matches[activeIndex].name);
      else add(query);
      return;
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === 'Backspace' && query === '' && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  const rowClassName = (active: boolean) =>
    `flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
      active
        ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-100'
        : 'text-gray-700 dark:text-gray-200'
    }`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <FieldLabel>{label}</FieldLabel>
        {value.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {selectedLabel} {value.length}
          </span>
        )}
      </div>

      <div ref={containerRef} className="relative">
        <div
          ref={shellRef}
          className={`${fieldShellClassName()} flex flex-wrap items-center gap-1.5 px-2 py-1.5`}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((name) => {
            const color = colorByName.get(norm(name));
            return (
              <span
                key={name}
                data-testid="tx-tag-chip"
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  color
                    ? ''
                    : 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800'
                }`}
                style={
                  color
                    ? { backgroundColor: `${color}18`, color, boxShadow: `inset 0 0 0 1px ${color}40` }
                    : undefined
                }
              >
                {name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(name);
                  }}
                  className="-mr-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/20"
                  aria-label={`Remove ${name}`}
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && rowCount > 0 ? `${listId}-${activeIndex}` : undefined}
            data-testid={testId}
          />
        </div>

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{ maxHeight: placement.maxHeight }}
            className={`absolute left-0 right-0 z-20 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-elevate-lg animate-fade-in dark:border-gray-700 dark:bg-gray-800 dark:shadow-elevate-lg-dark ${
              placement.up ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }`}
          >
            {matches.map((tag, index) => (
              <li key={tag.id}>
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  // Keep focus on the input so the chip lands and typing continues.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => add(tag.name)}
                  className={rowClassName(index === activeIndex)}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{tag.name}</span>
                  {index === activeIndex && (
                    <span className="ml-auto shrink-0 text-[11px] text-gray-400" aria-hidden="true">
                      ↵
                    </span>
                  )}
                </button>
              </li>
            ))}
            {canCreate && (
              <li className={matches.length > 0 ? 'mt-1 border-t border-gray-100 pt-1 dark:border-gray-700' : ''}>
                <button
                  type="button"
                  id={`${listId}-${matches.length}`}
                  role="option"
                  aria-selected={activeIndex === matches.length}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(matches.length)}
                  onClick={() => add(trimmed)}
                  className={rowClassName(activeIndex === matches.length)}
                  data-testid="tx-tag-create"
                >
                  <Plus size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
                  <span className="truncate">{createLabel(trimmed)}</span>
                </button>
              </li>
            )}
            {rowCount === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">{emptyLabel}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
