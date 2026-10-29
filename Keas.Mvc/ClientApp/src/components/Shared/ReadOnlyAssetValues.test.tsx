import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import KeySerialEditValues from '../Keys/KeySerialEditValues';
import { fakeKeySerials } from '../specs/mockData/KeySerial';

afterEach(cleanup);

it('displays immutable key values as text while keeping serial edits functional', () => {
  const change = vi.fn();
  const serial = fakeKeySerials[0];
  const { container, rerender } = render(<KeySerialEditValues keySerial={serial} disableEditing changeProperty={change} />);
  expect(container.querySelector('input, select, textarea')).toBeNull();
  expect(screen.getByText(serial.key.name)).toBeTruthy();
  rerender(<KeySerialEditValues keySerial={serial} disableEditing={false} changeProperty={change} />);
  expect(container.querySelectorAll('input')).toHaveLength(1);
  expect(container.querySelector('select')).not.toBeNull();
  expect(container.querySelector('textarea')).not.toBeNull();
  fireEvent.change(container.querySelector('input'), { target: { value: 'NEW-123' } });
  expect(change).toHaveBeenCalledWith('number', 'NEW-123');
});
