import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Context } from '../../Context';
import { AppContext } from '../../models/Shared';
import { IPerson } from '../../models/People';
import { AssignDocument } from './AssignDocument';

const templates = [
  { templateId: 'first', name: 'First template', teamId: 1, accountId: 'account', apiBasePath: '/api' },
  { templateId: 'second', name: 'Second template', teamId: 1, accountId: 'account', apiBasePath: '/api' }
];
const person = { name: 'Example Person', email: 'person@example.com' } as IPerson;

it('submits the selected template from the modal footer and preserves it after a failed send', async () => {
  const sendDocument = vi.fn().mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(undefined);
  const ctx = { team: { slug: 'sandbox' }, fetch: vi.fn().mockResolvedValue(templates) } as unknown as AppContext;
  render(<Context.Provider value={ctx}>
    <AssignDocument show setShow={vi.fn()} person={person} sendDocument={sendDocument} />
  </Context.Provider>);

  const select = await screen.findByRole('combobox', { name: 'Template to send' });
  fireEvent.change(select, { target: { value: 'second' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send document' }));
  await waitFor(() => expect(sendDocument).toHaveBeenCalledWith(templates[1]));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Send document' })).toBeEnabled());
  expect(screen.getByRole('combobox', { name: 'Template to send' })).toHaveValue('second');
  fireEvent.click(screen.getByRole('button', { name: 'Send document' }));
  await waitFor(() => expect(sendDocument).toHaveBeenCalledTimes(2));
});

it('allows cancelling when no templates are available without submitting a document', async () => {
  const close = vi.fn();
  const sendDocument = vi.fn();
  const ctx = { team: { slug: 'sandbox' }, fetch: vi.fn().mockResolvedValue([]) } as unknown as AppContext;
  render(<Context.Provider value={ctx}>
    <AssignDocument show setShow={close} person={person} sendDocument={sendDocument} />
  </Context.Provider>);
  await screen.findByText(/No documents are available to send/);
  expect(screen.queryByRole('button', { name: 'Send document' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledWith(false);
  expect(sendDocument).not.toHaveBeenCalled();
});
