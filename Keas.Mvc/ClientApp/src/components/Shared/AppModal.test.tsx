import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Modal, ModalBody, ModalFooter, ModalHeading } from './AppModal';

afterEach(cleanup);

describe('shared modal', () => {
  it('labels the dialog and routes close and cancel through its existing toggle', () => {
    const close = vi.fn();
    const save = vi.fn();
    render(<Modal isOpen toggle={close} fade={false}>
      <ModalHeading>Edit access</ModalHeading>
      <ModalBody><label>Name<input /></label></ModalBody>
      <ModalFooter><button onClick={save}>Save changes</button></ModalFooter>
    </Modal>);
    expect(screen.getByRole('dialog', { name: 'Edit access' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledTimes(2);
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('supports an explicit heading and custom cancel button without duplicating it', () => {
    render(<Modal isOpen labelledBy='equipment-title' fade={false}>
      <h2 id='equipment-title'>Equipment</h2>
      <ModalBody>Details</ModalBody>
      <ModalFooter showCancel={false}><button disabled>Cancel</button></ModalFooter>
    </Modal>);
    expect(screen.getByRole('dialog', { name: 'Equipment' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(1);
  });
});
