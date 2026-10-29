import * as React from 'react';
import { useState } from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SearchCombobox } from './SearchCombobox';

afterEach(cleanup);

describe('DaisyUI search combobox', () => {
  it('filters suggestions and selects with the keyboard', () => {
    const change = vi.fn();
    render(<SearchCombobox id='tags' options={['Laptop', 'Desktop']} onChange={change} multiple placeholder='Tags' />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'lap' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe('tags-option-0');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith(['Laptop']);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('removes controlled tags and clears all selections', () => {
    function Controlled() {
      const [selected, setSelected] = useState(['Laptop', 'Dell']);
      return <SearchCombobox id='tags' options={[]} onChange={setSelected} selected={selected} multiple clearButton />;
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Laptop' }));
    expect(screen.queryByRole('button', { name: 'Remove Laptop' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByRole('button', { name: 'Remove Dell' })).toBeNull();
  });

  it('creates a custom value using the configured field', () => {
    const change = vi.fn();
    render(<SearchCombobox id='keys' options={[]} labelKey='code' onChange={change} allowNew />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByRole('option'));
    expect(change).toHaveBeenCalledWith([{ customOption: true, code: 'ABC' }]);
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('ABC');
  });

  it('closes suggestions on Escape and blur, and disables selection', () => {
    const change = vi.fn();
    const view = render(<SearchCombobox id='tags' options={['Dell']} onChange={change} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).toBeNull();
    view.rerender(<SearchCombobox id='tags' options={['Dell']} onChange={change} disabled />);
    expect((input as HTMLInputElement).disabled).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });

  it('debounces remote searches, honors minimum length, and displays results', async () => {
    const search = vi.fn();
    const change = vi.fn();
    const view = render(<SearchCombobox id='people' options={[]} onChange={change} onSearch={search} minLength={3} labelKey='name' filterBy={() => true} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Al' } });
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.change(input, { target: { value: 'Ali' } });
    fireEvent.change(input, { target: { value: 'Alice' } });
    await waitFor(() => expect(search).toHaveBeenCalledWith('Alice'));
    expect(search).toHaveBeenCalledTimes(1);
    view.rerender(<SearchCombobox id='people' options={[{ name: 'Alice' }]} onChange={change} onSearch={search} minLength={3} labelKey='name' filterBy={() => true} />);
    fireEvent.click(await screen.findByRole('option'));
    expect(change).toHaveBeenCalledWith([{ name: 'Alice' }]);
  });
});
