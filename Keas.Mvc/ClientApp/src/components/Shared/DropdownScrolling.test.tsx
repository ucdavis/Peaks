import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetFilterBar } from './AssetFilterBar';
import { Modal, ModalBody } from './AppModal';
import { SearchCombobox } from './SearchCombobox';

afterEach(cleanup);

const options = Array.from({ length: 40 }, (_, index) => `Tag ${index + 1}`);
const dropdowns = [
  {
    name: 'search selectors',
    renderDropdown: (onChange: (values: string[]) => void) => (
      <SearchCombobox id='scroll-tags' options={options} onChange={onChange} multiple />
    )
  },
  {
    name: 'asset filters',
    renderDropdown: (onChange: (values: string[]) => void) => (
      <AssetFilterBar categories={Array.from({ length: 8 }, (_, index) => ({
        id: `category-${index}`,
        label: `Category ${index}`,
        options: options.slice(index * 5, index * 5 + 5),
        selected: [],
        onChange
      }))} />
    )
  }
];

describe.each(dropdowns)('$name scrolling', ({ renderDropdown }) => {
  const setup = () => {
    const change = vi.fn();
    render(<>
      {renderDropdown(change)}
      <button type='button'>Outside button</button>
      <p>Outside text</p>
    </>);
    const input = screen.getByRole('combobox');
    userEvent.click(input);
    return { input, change, list: screen.getByRole('listbox') };
  };

  it('keeps suggestions open through scrollbar blur, dragging, and scrolling', () => {
    const { input, list, change } = setup();
    // Do not cancel the native scrollbar's pointer action.
    expect(fireEvent.pointerDown(list)).toBe(true);
    act(() => input.blur());
    fireEvent.pointerMove(document.body);
    fireEvent.scroll(list, { target: { scrollTop: 250 } });
    fireEvent.pointerUp(document.body);
    expect(screen.getByRole('listbox')).toBe(list);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(change).not.toHaveBeenCalled();

    // Selecting after scrolling must close even when the input regains focus.
    userEvent.click(screen.getByRole('option', { name: 'Tag 40' }));
    expect(change).toHaveBeenCalledWith(['Tag 40']);
    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('dismisses on an outside pointer interaction, including non-focusable text', () => {
    setup();
    fireEvent.pointerDown(screen.getByText('Outside text'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keeps scrollbar focus inside a modal and supports keyboard selection afterward', () => {
    const change = vi.fn();
    const close = vi.fn();
    render(<Modal isOpen fade={false} toggle={close} labelledBy='scroll-dialog-title'>
      <h2 id='scroll-dialog-title'>Edit asset</h2>
      <ModalBody>{renderDropdown(change)}</ModalBody>
    </Modal>);
    userEvent.click(screen.getByRole('combobox'));
    const list = screen.getByRole('listbox');
    // Native scrollbar clicks can focus the closest focusable ancestor. Without
    // a focusable list, that is the modal, which looks like an outside focus.
    expect(fireEvent.mouseDown(list)).toBe(true);
    act(() => list.closest<HTMLElement>('[tabindex]')?.focus());
    expect(screen.getByRole('listbox')).toBe(list);
    expect(list).toHaveFocus();
    fireEvent.mouseUp(list);
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith(['Tag 1']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Edit asset' })).toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();
  });

  it('does not dismiss on a window blur without an outside interaction', () => {
    const { list } = setup();
    fireEvent.blur(window);
    expect(screen.getByRole('listbox')).toBe(list);
  });

  it('dismisses when focus moves outside without a pointer interaction', () => {
    setup();
    act(() => screen.getByRole('button', { name: 'Outside button' }).focus());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it.each([false, true])('dismisses on Tab with shift=%s and preserves focus navigation', shift => {
    const { input } = setup();
    userEvent.tab({ shift });
    expect(input).not.toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('dismisses on Escape after the scrollbar blurs the input', () => {
    const { input, list } = setup();
    fireEvent.pointerDown(list);
    act(() => input.blur());
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('preserves keyboard selection after scrolling and refocusing the input', () => {
    const { input, list, change } = setup();
    fireEvent.pointerDown(list);
    act(() => input.blur());
    fireEvent.scroll(list, { target: { scrollTop: 250 } });
    userEvent.click(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByRole('option', { name: 'Tag 1' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith(['Tag 1']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

it('closes the previous selector when another selector is opened', () => {
  render(<>
    <SearchCombobox id='first-tags' placeholder='First tags' options={options} onChange={vi.fn()} />
    <SearchCombobox id='second-tags' placeholder='Second tags' options={options} onChange={vi.fn()} />
  </>);
  const first = screen.getByRole('combobox', { name: 'First tags' });
  const second = screen.getByRole('combobox', { name: 'Second tags' });
  userEvent.click(first);
  userEvent.click(second);
  expect(first).toHaveAttribute('aria-expanded', 'false');
  expect(second).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getAllByRole('listbox')).toHaveLength(1);
});
