import * as React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface AssetFilterCategory {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  allowCustom?: boolean;
}

export const AssetFilterBar = ({
  categories
}: {
  categories: AssetFilterCategory[];
}) => {
  const id = React.useId();
  const input = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const term = query.trim();
  const suggestions = categories.flatMap(category => {
    const matches = Array.from(new Set(category.options))
      .filter(
        value =>
          typeof value === 'string' &&
          value.length > 0 &&
          !category.selected.includes(value) &&
          value.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 5)
      .map(value => ({ category, value, custom: false }));
    if (
      category.allowCustom &&
      term &&
      !category.selected.some(
        value => value.toLowerCase() === term.toLowerCase()
      ) &&
      !matches.some(option => option.value.toLowerCase() === term.toLowerCase())
    ) {
      matches.push({ category, value: term, custom: true });
    }
    return matches;
  });
  const chips = categories.flatMap(category =>
    category.selected.map(value => ({ category, value }))
  );
  const add = (index: number) => {
    const option = suggestions[index];
    if (!option) return;
    option.category.onChange([...option.category.selected, option.value]);
    setQuery('');
    setActive(-1);
    setOpen(false);
    input.current?.focus();
  };

  React.useEffect(() => {
    if (open && active >= 0)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open, id]);

  return (
    <div className='mb-5 space-y-3'>
      <div className='flex items-center gap-3'>
        <div
          className='relative min-w-0 flex-1'
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setOpen(false);
              setActive(-1);
            }
          }}
        >
          <label className='input flex w-full items-center gap-3'>
            <MagnifyingGlassIcon
              className='size-5 shrink-0 text-base-content/50'
              aria-hidden='true'
            />
            <input
              ref={input}
              className='min-w-0 grow'
              role='combobox'
              aria-label='Search asset filters'
              aria-autocomplete='list'
              aria-expanded={open}
              aria-controls={`${id}-suggestions`}
              aria-activedescendant={
                open && active >= 0 ? `${id}-option-${active}` : undefined
              }
              aria-describedby={`${id}-help`}
              autoComplete='off'
              placeholder={
                categories.length === 1
                  ? `Search ${categories[0].label.toLowerCase()}…`
                  : 'Search tags, attributes, managed system ID, make, model…'
              }
              value={query}
              onFocus={() => setOpen(true)}
              onChange={event => {
                setQuery(event.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onKeyDown={event => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  setOpen(true);
                  if (suggestions.length)
                    setActive(index =>
                      event.key === 'ArrowDown'
                        ? (index + 1) % suggestions.length
                        : index <= 0
                        ? suggestions.length - 1
                        : index - 1
                    );
                } else if (event.key === 'Enter') {
                  event.preventDefault();
                  if (open && active >= 0) add(active);
                } else if (event.key === 'Escape') {
                  if (open) event.stopPropagation();
                  setOpen(false);
                  setActive(-1);
                }
              }}
            />
          </label>
          {open && (
            <div
              id={`${id}-suggestions`}
              role='listbox'
              aria-label='Filter suggestions'
              className='absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-box border border-main-border bg-base-100 p-2 shadow-lg'
            >
              {suggestions.length === 0 && (
                <p className='m-0 px-3 py-4 text-sm text-base-content/60'>
                  No matching filters.
                </p>
              )}
              {categories.map(category => {
                const options = suggestions
                  .map((option, index) => ({ ...option, index }))
                  .filter(option => option.category.id === category.id);
                if (!options.length) return null;
                return (
                  <div
                    key={category.id}
                    role='group'
                    aria-labelledby={`${id}-${category.id}`}
                  >
                    <div
                      id={`${id}-${category.id}`}
                      className='px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-base-content/60'
                    >
                      {category.label}
                    </div>
                    {options.map(option => (
                      <div
                        key={option.value}
                        id={`${id}-option-${option.index}`}
                        role='option'
                        aria-selected={active === option.index}
                        className={`cursor-pointer rounded-sm px-3 py-2 text-sm break-words ${
                          active === option.index
                            ? 'bg-base-200'
                            : 'hover:bg-base-200'
                        }`}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => add(option.index)}
                      >
                        {option.custom
                          ? `Search ${category.label.toLowerCase()} for “${
                              option.value
                            }”`
                          : option.value}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {chips.length > 0 && (
          <button
            type='button'
            className='btn btn-sm btn-ghost shrink-0'
            onClick={() => {
              categories.forEach(category => category.onChange([]));
              setQuery('');
              setActive(-1);
            }}
          >
            Clear all
          </button>
        )}
      </div>
      <p id={`${id}-help`} className='m-0 text-xs text-base-content/60'>
        Choose a categorized suggestion to add a filter. Combine filters to
        narrow your results.
      </p>
      {chips.length > 0 && (
        <div className='flex flex-wrap gap-2' aria-label='Active filters'>
          {chips.map(({ category, value }) => (
            <span
              key={`${category.id}-${value}`}
              className='inline-flex max-w-full items-center gap-2 rounded-sm border border-main-border bg-base-200 py-1 ps-3 pe-1 text-sm'
            >
              <span className='min-w-0 break-words'>
                <strong>{category.label}:</strong> {value}
              </span>
              <button
                type='button'
                className='btn btn-xs btn-square btn-ghost shrink-0'
                aria-label={`Remove ${category.label}: ${value}`}
                onClick={() =>
                  category.onChange(
                    category.selected.filter(selected => selected !== value)
                  )
                }
              >
                <XMarkIcon className='size-4' aria-hidden='true' />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
