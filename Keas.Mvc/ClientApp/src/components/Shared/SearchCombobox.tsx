import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  id: string;
  options: any[];
  selected?: any[];
  defaultSelected?: any[];
  onChange: (options: any[]) => void;
  onSearch?: (query: string) => void | Promise<void>;
  labelKey?: string | ((option: any) => string);
  multiple?: boolean;
  disabled?: boolean;
  clearButton?: boolean;
  isInvalid?: boolean;
  isLoading?: boolean;
  minLength?: number;
  placeholder?: string;
  allowNew?: boolean;
  emptyLabel?: string;
  newSelectionPrefix?: string;
  filterBy?: (option: any) => boolean;
  highlightOnlyResult?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  renderMenuItemChildren?: (option: any, props: { text: string }, index: number) => React.ReactNode;
}

export const SearchCombobox = (props: Props) => {
  const [internal, setInternal] = useState(props.defaultSelected || []);
  const selected = props.selected === undefined ? internal : props.selected;
  const label = (option: any): string => typeof option === 'string' ? option
    : typeof props.labelKey === 'function' ? props.labelKey(option)
    : String(option?.[props.labelKey || 'label'] || '');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const search = useRef(props.onSearch);
  search.current = props.onSearch;
  // Serialize searches so an older response never overwrites a newer response.
  const requests = useRef<Promise<void>>(Promise.resolve());
  const asyncSearch = !!props.onSearch;
  const eligible = query.trim().length >= (props.minLength ?? (asyncSearch ? 2 : 0));
  useEffect(() => {
    if (!asyncSearch || !eligible || !open || props.disabled) { setPending(false); return; }
    let cancelled = false;
    setPending(true);
    const timer = window.setTimeout(() => {
      requests.current = requests.current.catch(() => {}).then(async () => {
        if (cancelled) return;
        try { await search.current(query); }
        finally { if (!cancelled) setPending(false); }
      });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, asyncSearch, eligible, open, props.disabled]);
  const loading = asyncSearch && (pending || props.isLoading);
  const options = eligible && !loading ? (props.options || []).filter(option =>
    !selected.some(value => label(value) === label(option)) &&
    (props.filterBy ? props.filterBy(option) : label(option).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  ) : [];
  const canCreate = eligible && !loading && props.allowNew && query.trim() &&
    ![...(props.options || []), ...selected].some(option => label(option).toLocaleLowerCase() === query.trim().toLocaleLowerCase());
  const choices = canCreate ? [...options, {
    customOption: true, [typeof props.labelKey === 'string' ? props.labelKey : 'label']: query.trim()
  }] : options;
  const expanded = open && !props.disabled && eligible;
  const activeIndex = active >= 0 && active < choices.length ? active : -1;
  useEffect(() => {
    if (expanded && activeIndex >= 0) {
      document.getElementById(`${props.id}-option-${activeIndex}`)?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeIndex, expanded, props.id]);
  const commit = (values: any[]) => { setInternal(values); props.onChange(values); };
  const choose = (option: any) => {
    commit(props.multiple ? [...selected, option] : [option]);
    setQuery(''); setActive(-1); input.current?.focus(); setOpen(false);
  };
  return (
    <div className='relative w-full min-w-0' onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) { setOpen(false); setActive(-1); }
    }}>
      <div className={`input flex h-auto min-h-10 w-full flex-wrap items-center gap-2 py-2 ${props.isInvalid ? 'input-error' : ''} ${props.disabled ? 'bg-base-200 opacity-60' : ''}`}>
        {props.multiple && selected.map((option, index) => (
          <span key={`${label(option)}-${index}`} className='badge badge-asset badge-soft h-auto max-w-full gap-1 py-1'>
            <span className='break-words'>{label(option)}</span>
            {!props.disabled && <button type='button' className='shrink-0 rounded focus-visible:outline-2'
              aria-label={`Remove ${label(option)}`} onClick={() => commit(selected.filter((_, i) => i !== index))}>
              <XMarkIcon className='size-3.5' aria-hidden='true' />
            </button>}
          </span>
        ))}
        <input {...props.inputProps} ref={input} id={props.inputProps?.id || props.id}
          className='min-w-16 flex-1 border-0 bg-transparent p-0 text-sm text-base-content outline-none disabled:cursor-not-allowed'
          role='combobox' aria-label={props.inputProps?.['aria-label'] || props.placeholder}
          aria-autocomplete='list' aria-expanded={expanded} aria-controls={`${props.id}-options`}
          aria-activedescendant={expanded && activeIndex >= 0 ? `${props.id}-option-${activeIndex}` : undefined}
          aria-invalid={props.isInvalid || undefined} aria-busy={loading || undefined}
          autoComplete='off' disabled={props.disabled} placeholder={selected.length ? '' : props.placeholder}
          value={!props.multiple && selected.length ? label(selected[0]) : query}
          onFocus={() => setOpen(true)}
          onChange={event => {
            if (!props.multiple && selected.length) commit([]);
            setQuery(event.target.value); setOpen(true); setActive(-1);
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault(); setOpen(true);
              setActive(event.key === 'ArrowDown' ? Math.min(activeIndex + 1, choices.length - 1)
                : activeIndex <= 0 ? choices.length - 1 : activeIndex - 1);
            } else if (event.key === 'Enter' && expanded && choices.length) {
              event.preventDefault(); choose(choices[activeIndex >= 0 ? activeIndex : 0]);
            } else if (event.key === 'Escape' && open) {
              event.preventDefault(); event.stopPropagation(); setOpen(false); setActive(-1);
            } else if (event.key === 'Backspace' && !query && props.multiple && selected.length) {
              commit(selected.slice(0, -1));
            }
          }} />
        {loading && <span role='status' aria-label='Searching' className='loading loading-spinner loading-xs' />}
        {props.clearButton && selected.length > 0 && !props.disabled && (
          <button type='button' className='btn btn-ghost btn-square btn-xs shrink-0' aria-label='Clear selection'
            onClick={() => { commit([]); setQuery(''); input.current?.focus(); setOpen(false); }}>
            <XMarkIcon className='size-4' aria-hidden='true' />
          </button>
        )}
      </div>
      {expanded && <ul id={`${props.id}-options`} role='listbox'
        className='menu absolute inset-x-0 top-full z-50 mt-1 max-h-64 flex-nowrap overflow-y-auto rounded-box border border-base-content/15 bg-base-100 p-1 shadow-lg'>
        {choices.map((option, index) => (
          <li key={index} role='option' id={`${props.id}-option-${index}`} aria-selected={index === activeIndex}
            onMouseDown={event => event.preventDefault()} onMouseMove={() => setActive(index)} onClick={() => choose(option)}>
            <div className={`block break-words ${index === activeIndex ? 'bg-base-200' : ''}`}>
              {option.customOption ? `${props.newSelectionPrefix || 'Add: '}${label(option)}`
                : props.renderMenuItemChildren ? props.renderMenuItemChildren(option, { text: query }, index) : label(option)}
            </div>
          </li>
        ))}
        {!choices.length && <li role='presentation'><span className='text-sm text-base-content/60'>
          {loading ? 'Searching…' : props.emptyLabel ?? 'No matches found'}
        </span></li>}
      </ul>}
    </div>
  );
};

export const Highlighter = ({ children, search }: { children?: React.ReactNode; search: string }) => {
  const text = String(children ?? '');
  const index = search ? text.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) : -1;
  return index < 0 ? <>{text}</> : <>{text.slice(0, index)}<mark className='bg-primary/15 text-inherit'>{text.slice(index, index + search.length)}</mark>{text.slice(index + search.length)}</>;
};
